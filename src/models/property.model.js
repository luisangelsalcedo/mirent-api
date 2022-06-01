import mongoose from "mongoose";
import { errorResponse, objectPropertyExiste } from "../utils/index.js";
import { propertySchema, propertyDefaultStatus } from "../schemas/index.js";

/**
 *
 * * VALIDATE
 * valida que no exista otra propiedad con un nombre repetido (owner)
 *
 */
// propertySchema.path("name").validate({
//   async validator(name) {
//     let owner;
//     if (this.owner) owner = this.owner;
//     else owner = this.property.owner;
//     return mongoose
//       .model("Property")
//       .findOne({ name, owner })
//       .then((property) => !property);
//   },
//   message: "is already taken",
// });
/**
 *
 * Valida que el precio sea solo números
 *
 */
propertySchema.path("price").validate({
  async validator(price) {
    return Number(price);
  },
  message: "only required numbers",
});
//
//
//
//
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
/**
 *
 * * MIDDLEWARE REMOVE
 * valida que no se pueda eliminar la propiedad cuando esta en estado activo o alquilado
 *
 */
propertySchema.pre("remove", function (next) {
  if (this.status.rented)
    throw errorResponse(403, "cannot be removed while rented");

  if (this.status.available)
    throw errorResponse(403, "cannot be removed while available");

  next();
});
/**
 *
 * cuando se eliminar la propiedad eliminar las demas entidades inculadas (agreement, rent, notification)
 *
 */
propertySchema.post("remove", function (property) {});
/**
 *
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde insertamos los datos que vamos a actualizar
 *
 */
propertySchema.pre("updateOne", function (next) {
  if (this._update) {
    const { $set, $setOnInsert, ...res } = this._update;
    this.body = res;
    next();
  }
  throw errorResponse(422, "empty content");
});
/**
 *
 * valida que NO se pueda editar el propitatio
 *
 */
propertySchema.pre("updateOne", function (next) {
  const { owner } = this.body;
  if (owner) throw errorResponse(403, "owner can not be modify");
  next();
});
/**
 *
 * buscamos el documento property que vamos a actualizar y validamos según su estado
 * MANTENIMIENTO: permiso de editar todo
 * DISPONIBLE: permiso de modificar el estado y el precio
 * ALQUILADO: solo puede editar el estado si propiedad NO está vinculada a un contrato (disabled || active)
 * actualizamos el estado basandonos en la lista de estados por defecto
 *
 */
propertySchema.pre("updateOne", async function (next) {
  const property = await this.model.findOne(this._conditions);
  this.property = property;

  const { maintenance, available, rented } = property.status;

  // MANTENIMIENTO
  if (maintenance) next();

  // DISPONIBLE
  if (available) {
    const { status, agreement, occupant, notificacions, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "only status can be updated");
    next();
  }

  // ALQUILADO
  if (rented) {
    const { status, rents, occupant, notificacions, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "cannot be modified when rented");
    next();
  }
});
/**
 *
 * actualizamos el estado basandonos en la lista de estados por defecto
 *
 */
propertySchema.pre("updateOne", function (next) {
  const { status } = this._update;
  if (status) {
    const key = Object.keys(status)[0];
    if (!objectPropertyExiste(propertyDefaultStatus, key))
      throw errorResponse(422, `'${key}' state you want to set does not exist`);

    const update = { ...propertyDefaultStatus, ...status };
    this._update.status = update;
  }
  next();
});

//
//
//
//
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
/**
 *
//  * FIND ALL
 *
 */
propertySchema.statics.findAllStatics = async function (req) {
  const { id } = req.auth;
  const arr = await this.find({ owner: id })
    .populate({ path: "occupant" })
    .populate({ path: "agreement" })
    .populate({ path: "rents" })
    .populate({ path: "notifications" });
  if (!arr.length) throw errorResponse(204);
  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
propertySchema.statics.findByIdStatics = async function (id) {
  const property = await this.findById(id)
    .populate({ path: "occupant" })
    .populate({ path: "agreement" })
    .populate({ path: "rents" })
    .populate({ path: "notifications" });
  if (property) return property;

  throw errorResponse(404, "property not found");
};
/**
 *
 * * UPDATE
 *
 */
propertySchema.statics.updateStatics = async function (req) {
  const { property, body } = req;
  const updated = await property.updateOne(body, { runValidators: true });
  if (updated.acknowledged)
    return this.findById(property._id)
      .populate({ path: "occupant" })
      .populate({ path: "agreement" })
      .populate({ path: "rents" })
      .populate({ path: "notifications" });

  throw errorResponse(422, "could not update user");
};
//
//
//
//
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
/**
 *
 * * EXPORT MODEL
 *
 */
const propertyModel = mongoose.model("Property", propertySchema);
export default propertyModel;
