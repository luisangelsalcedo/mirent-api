import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateJWT, errorResponse } from "../utils/index.js";
import { config } from "../config/index.js";

const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/,
        "invalid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "is required"],
    },
    image: String,
    auth0: Boolean,
    dni: String,
    phone: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
/**
 * * validate
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
 * * middleware
 */
userSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});
/**
 * * statics
 */
userSchema.statics.userAuth = async function (req) {
  const { email, password: pass } = req.body;
  const user = await this.findOne({ email });

  if (user)
    return new Promise((resolve, reject) => {
      bcrypt.compare(pass, user.password, (err, result) => {
        if (err) {
          reject(errorResponse(422, "password is required"));
        }
        if (!result) {
          reject(errorResponse(403, "password is not correct"));
        }
        resolve(generateJWT({ id: user._id, name: user.name }));
      });
    });

  throw errorResponse(404, "user not found");
};
/**
 * * statics
 */
userSchema.statics.verifyToken = async function (req) {
  const { token } = req.params;

  return new Promise((resolve, reject) => {
    jwt.verify(token, config.token.secret, (err, payload) => {
      if (err) {
        reject(errorResponse(401, "invalid token"));
      }

      this.findById(payload.id).then((user) => {
        if (!user) reject(errorResponse(401, "invalid token"));
        else resolve(payload);
      });
    });
  });
};
/**
 *
 *
 */
const userModel = mongoose.model("User", userSchema);
export default userModel;
