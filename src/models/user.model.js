import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userSchema } from "../schemas/index.js";
import {
  generateHash,
  generateJWT,
  errorResponse,
  sendMail,
} from "../utils/index.js";
import { config } from "../config/index.js";
import { mailRecoverPassword } from "../email/index.js";

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
userSchema.pre("save", async function (next) {
  try {
    this.password = await generateHash(this.password);
    next();
  } catch (error) {
    next(error);
  }
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
 * encripta el password antes de actualizar usuario
 */
userSchema.pre("updateOne", async function (next) {
  const { password } = this._update;
  try {
    this._update.password = await generateHash(password);
    next();
  } catch (error) {
    next(error);
  }
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
 * * FIND USERNAME
 *
 */
userSchema.statics.findUsername = async function (req) {
  const { email } = req.body;
  if (!email) throw errorResponse(422, "email is required");

  const user = await this.findOne({ email });
  if (!user) throw errorResponse(404, "user not found");

  const { _id: id, name } = user;
  const token = await generateJWT({ id, name });

  const enlace = `${req.headers.origin}/replacepassword`;
  const msg = {
    to: email,
    from: "seemc9@gmail.com",
    subject: "Restablece la contraseña de miRent",
    html: mailRecoverPassword({ name, token, enlace }),
  };
  try {
    await sendMail(msg);
    return token;
  } catch (error) {
    throw new Error(error);
  }
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
