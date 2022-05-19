import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userSchema } from "../schemas/index.js";
import { generateJWT, errorResponse } from "../utils/index.js";
import { config } from "../config/index.js";

/**
 *
 * * VALIDATE
 * valida que no exista otro usuario con el mismo email
 */
userSchema.path("email").validate({
  async validator(email) {
    return mongoose
      .model("User")
      .findOne({ email })
      .then((user) => !user);
  },
  message: "is already taken",
});
/**
 * * MIDDLEWARE SAVE
 * encripta el password antes de guardar
 */
userSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});
/**
 * * MIDDLEWARE UPDATE
 * valida que NO se pueda editar el email
 */
userSchema.pre("updateOne", function (next) {
  const { email } = this._update;
  if (email) throw errorResponse(403, "email can not be modify");
  next();
});
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * USER AUTH
 *
 */

userSchema.statics.userAuth = async function (req) {
  const { email, password: pass } = req.body;
  const user = await this.findOne({ email });

  return new Promise((resolve, reject) => {
    if (!user) reject(errorResponse(404, "user not found"));
    if (!pass) reject(errorResponse(422, "password is required"));

    bcrypt.compare(pass, user.password, (err, result) => {
      if (!result) {
        reject(errorResponse(403, "password is not correct"));
      }
      const { _id: id, name } = user;
      resolve(generateJWT({ id, name }));
    });
  });
};
/**
 *
 * * VERIFY TOKEN
 *
 */
userSchema.statics.verifyToken = async function (req) {
  const { token } = req.params;

  return new Promise((resolve, reject) => {
    jwt.verify(token, config.token.secret, (err, payload) => {
      if (err) reject(errorResponse(401, "invalid token"));

      this.findById(payload.id).then((user) => {
        if (!user) reject(errorResponse(401, "invalid token"));
        else resolve(payload);
      });
    });
  });
};
/**
 *
 * * UPDATE
 *
 */
userSchema.statics.updateStatics = async function (req) {
  const { user, body } = req;
  if (!Object.keys(body).length) throw errorResponse(422, "empty content");

  const updated = await user.updateOne(body);
  if (updated.acknowledged) return this.findById(user._id);
  return null;
};
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * EXPORT MODEL
 *
 */
const userModel = mongoose.model("User", userSchema);
export default userModel;
