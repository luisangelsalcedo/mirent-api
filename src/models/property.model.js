import mongoose from "mongoose";
import { errorResponse, objectPropertyExiste } from "../utils/index.js";
import { propertySchema, propertyDefaultStatus } from "../schemas/index.js";

const findAgreementProperty = async (property) => {
  const agreement = await mongoose
    .model("Agreement")
    .findOne({ property: property._id });

  return agreement;
};
/**
 * * VALIDATE
 * valida que no exista otra propiedad con un nombre repetido creado por un mismo propietario
 */
propertySchema.path("name").validate({
  async validator(name) {
    return mongoose
      .model("Property")
      .findOne({ name, owner: this.owner })
      .then((property) => !property);
  },
  message: "is already taken",
});
/**
 * * MIDDLEWARE REMOVE
 * valida que no se pueda eliminar la propiedad cuando esta en estado alquilado
 */
propertySchema.pre("remove", function (next) {
  if (this.status.rented)
    throw errorResponse(403, "cannot be removed while rented");
  next();
});
/**
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde incertamos los datos que vamos a actualizar
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
 * valida que NO se pueda editar el propitatio
 */
propertySchema.pre("updateOne", function (next) {
  const { owner } = this.body;
  if (owner) throw errorResponse(403, "owner can not be modify");
  next();
});
/**
 * buscamos el documento property que vamos a actualizar y validamos según su estado
 * MANTENIMIENTO: permiso de editar todo
 * DISPONIBLE: permiso de modificar el estado y el precio
 * ALQUILADO: solo puede editar el estado si propiedad NO está vinculada a un contrato (disabled || active)
 */
propertySchema.pre("updateOne", async function (next) {
  const property = await this.model.findOne(this._conditions);
  this.property = property;

  const { maintenance, available, rented } = property.status;

  // MANTENIMIENTO
  if (maintenance) next();

  // DISPONIBLE
  if (available) {
    const { status, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "only status can be updated");
    next();
  }

  // ALQUILADO
  if (rented) {
    const { status, ...res } = this.body;
    const agreement = await findAgreementProperty(property);
    if (
      Object.keys(res).length ||
      agreement?.status.active ||
      agreement?.status.disabled
    )
      throw errorResponse(403, "cannot be modified when rented");
    next();
  }
});
/**
 * actualizamos el estado basandonos en la lista de estados por defecto
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
/**
 *
 */
propertySchema.pre("updateOne", function (next) {
  const { price } = this.property;
  const { status } = this.body;

  if (status?.available) {
    if (!price) throw errorResponse(422, "price is required");
  }
  next();
});
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * FIND ALL
 *
 */
propertySchema.statics.findAllStatics = async function (req) {
  const { id } = req.auth;
  const arr = await this.find({ owner: id });
  if (!arr.length) throw errorResponse(204);
  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
propertySchema.statics.findByIdStatics = async function (id) {
  const property = await this.findById(id);
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
  const updated = await property.updateOne(body);
  if (updated.acknowledged) return this.findById(property._id);

  throw errorResponse(422, "could not update user");
};
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * EXPORT MODEL
 *
 */
const propertyModel = mongoose.model("Property", propertySchema);
export default propertyModel;
