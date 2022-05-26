import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userSchema } from "../schemas/index.js";
import {
  generateHash,
  generateJWT,
  errorResponse,
  sendMail,
  destroyImgCloudinary,
} from "../utils/index.js";
import { config } from "../config/index.js";
import { mailRecoverPassword } from "../email/index.js";
import { expreg } from "../constant/index.js";
import { isDni } from "../utils/validators.js";

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
 * valida que se registre un numero de dni válido
 */
userSchema.path("dni").validate({
  async validator(dni) {
    return isDni(dni);
  },
  message: "requires a valid DNI",
});
/**
 * valida que se registre un numero
 */
userSchema.path("phone").validate({
  async validator(phone) {
    if (Number(phone)) return true;
    return false;
  },
  message: "requires only numbers",
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
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde incertamos los datos que vamos a actualizar
 */
userSchema.pre("updateOne", function (next) {
  if (this._update) {
    const { $set, $setOnInsert, ...res } = this._update;
    this.body = res;
    next();
  }
  throw errorResponse(422, "empty content");
});
/**
 * valida que NO se pueda editar el email
 */
userSchema.pre("updateOne", function (next) {
  const { email } = this._update;
  if (email) throw errorResponse(403, "email can not be modify");
  next();
});
/**
 * cargamos el registro anterior para comparlo en otras validaciones
 */
userSchema.pre("updateOne", async function (next) {
  const user = await this.model.findOne(this._conditions);
  this.userPrevius = user;
  next();
});
/**
 * encripta el password antes de actualizar usuario
 */
userSchema.pre("updateOne", async function (next) {
  const { password } = this._update;
  if (password) {
    try {
      this._update.password = await generateHash(password);
      next();
    } catch (error) {
      next(error);
    }
  }
  next();
});
/**
 * comparamos el registro anterior con el actualizado y verificamos si cambió la imagen
 *  true: Eliminamos la imagen de cloudinary
 *  false: Sin acción
 */
userSchema.post("updateOne", async function () {
  const user = await this.model.findOne(this._conditions);
  const { userPrevius } = this;

  if (userPrevius.image.imageId) {
    if (userPrevius.image.imageId !== user.image.imageId) {
      const { result, error } = await destroyImgCloudinary(
        userPrevius.image.imageId
      );
      if (error) throw new Error(error);
    }
  }
  // else console.log("Conservar imagen");
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
  if (!email) throw errorResponse(422, "email is required");

  const validEmail = expreg.email.test(email);
  if (!validEmail) throw errorResponse(422, "invalid email address");

  const user = await this.findOne({ email });

  return new Promise((resolve, reject) => {
    if (!user) reject(errorResponse(404, "user not found"));
    if (!pass) reject(errorResponse(422, "password is required"));

    bcrypt.compare(pass, user.password, (err, result) => {
      if (!result) {
        reject(errorResponse(403, "password is not correct"));
      }
      const { _id: id, name, image } = user;
      resolve(generateJWT({ id, name, image: image.thumb }));
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

  const validEmail = expreg.email.test(email);
  if (!validEmail) throw errorResponse(422, "invalid email address");

  const user = await this.findOne({ email });
  if (!user) throw errorResponse(404, "user not found");

  const { _id: id, name } = user;

  const token = await generateJWT({ id, name }, 60 * 5);

  const enlace = `${req.headers.origin}/replacepassword`;
  const msg = {
    from: '"miRent support" <support@mirent.app>',
    to: email,
    subject: "Restablece la contraseña de miRent",
    html: mailRecoverPassword({ name, token, enlace }),
  };

  try {
    const send = await sendMail(msg);
    if (send) return token;
    // return token;
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

  const updated = await user.updateOne(body, { runValidators: true });
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
