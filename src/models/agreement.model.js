import mongoose from "mongoose";
import { errorResponse, objectPropertyExiste } from "../utils/index.js";
import { agreementSchema, agreementDefaultStatus } from "../schemas/index.js";

const findProperty = async (id) => {
  const property = await mongoose.model("Property").findById(id);
  return property;
};
/**
 * * VALIDATE
 * valida que solo se pueda registrar una propiedad que tenga estado disponible
 */
agreementSchema.path("property").validate({
  async validator(property) {
    return mongoose
      .model("Property")
      .findOne({ _id: property })
      .then((find) => {
        if (find?.status.available) return true;
        return false;
      });
  },
  message: "add an available property",
});

/**
 * * MIDDLEWARE SAVE
 * valida que la propiedad no este inscrita en otra contrato
 * a menos que el contrato este archivado
 */
agreementSchema.pre("save", async function (next) {
  const agreement = await mongoose
    .model("Agreement")
    .findOne({ property: this.property });

  if (agreement?.status.disabled || agreement?.status.active)
    throw errorResponse(403, "property is already taken");
  next();
});
/**
 * despues de guardar el contrato cambiamos la propiedad a estado alquilado (rented)
 */
agreementSchema.post("save", async function (agreement) {
  const property = await findProperty(agreement.property);
  const updated = await property.updateOne({ status: { rented: true } });
  if (!updated.acknowledged)
    throw errorResponse(500, "the related property did not change state");
});
/**
 * * MIDDLEWARE REMOVE
 *  valida que solo se pueda eliminar el contrato cuando este desabilitado o archivado
 */
agreementSchema.pre("remove", function (next) {
  if (this.status.disabled || this.status.archived) next();
  throw errorResponse(
    403,
    "deactivate or archive the agreement before deleting"
  );
});
/**
 * despues de eliminar el contrato cambiarmos la propiedad a estado disponible (available)
 */
agreementSchema.post("remove", async function (agreement) {
  const property = await findProperty(agreement.property);
  const updated = await property.updateOne({ status: { available: true } });
  if (!updated.acknowledged)
    throw errorResponse(500, "the related property did not change state");
});
/**
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde incertamos los datos que vamos a actualizar
 */
agreementSchema.pre("updateOne", function (next) {
  if (this._update) {
    const { $set, $setOnInsert, ...res } = this._update;
    this.body = res;
    next();
  }
  throw errorResponse(422, "empty content");
});
/**
 * valida que NO se pueda editar la propiedad
 */
agreementSchema.pre("updateOne", function (next) {
  const { property } = this.body;
  if (property) throw errorResponse(403, "property can not be modify");
  next();
});
/**
 * buscamos el documento agreement que vamos a actualizar y validamos según su estado
 * DESABILITADO: No se puede firmar o genera pagos o notificaciones, está permitido lo demás
 * ACTIVO: Se puede modificar solo el estado, la firma y seleccionar el ocupante
 * FIRMADO: Se puede modificar solo el estado, generar pagos y notificaciones
 * ARCHIVADO: no se puede editar ningún campo
 */
agreementSchema.pre("updateOne", async function (next) {
  const agreement = await this.model.findOne(this._conditions);
  const { disabled, active, signed, archived } = agreement.status;

  // DESABILITADO
  if (disabled) {
    const { sign, rents, notification } = this.body;
    if (sign)
      throw errorResponse(403, "activate the agreement to be able to sign it");
    if (rents)
      throw errorResponse(403, "activate the agreement to make payments");
    if (notification)
      throw errorResponse(403, "activate the agreement to make notifications");
    next();
  }

  // ACTIVO
  if (active) {
    const { status, sign, occupant, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "cannot modify an active agreement");
    next();
  }

  // FIRMADO
  if (signed) {
    const { status, rents, notification, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "cannot modify an signed agreement");
    next();
  }

  // ARCHIVADO
  if (archived) {
    throw errorResponse(403, "cannot modify an archived agreement");
  }
});
/**
 * actualizamos el estado basandonos en la lista de estados por defecto
 */
agreementSchema.pre("updateOne", function (next) {
  const { status } = this._update;
  if (status) {
    const key = Object.keys(status)[0];
    if (!objectPropertyExiste(agreementDefaultStatus, key))
      throw errorResponse(422, `'${key}' state you want to set does not exist`);

    const updated = { ...agreementDefaultStatus, ...status };
    this._update.status = updated;
  }
  next();
});
/**
 * validamos los requisitos minimos para activar o firmar el contrato
 */
agreementSchema.pre("updateOne", async function (next) {
  const { occupant, sign, startdate, enddate, details } =
    await this.model.findOne(this._conditions);
  const { status } = this.body;

  if (status?.active) {
    if (!startdate) throw errorResponse(403, "startdate is required");
    if (!enddate) throw errorResponse(403, "enddate is required");
    if (!details) throw errorResponse(403, "details is required");
  }

  if (status?.signed) {
    if (!occupant) throw errorResponse(403, "occupant is required");
    if (!sign) throw errorResponse(403, "sign is required");
    if (!startdate) throw errorResponse(403, "stardate is required");
    next();
  }
  next();
});
/**
 * si archivamos el agreement cambiamos la propiedad vincuada a estado disponible (available)
 */
agreementSchema.post("updateOne", async function () {
  const agreement = await this.model.findOne(this._conditions);
  const { status } = agreement;

  if (status.archived) {
    const property = await findProperty(agreement.property);
    const updated = await property.updateOne({ status: { available: true } });
    if (!updated.acknowledged)
      throw errorResponse(500, "the related property did not change state");
  }
});
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * GET ALL BY PROPERTY
 *
 */
agreementSchema.statics.findAllByPropertyStatics = async function (req) {
  const { property } = req.params;
  const arr = await this.find({
    property,
  }).populate({
    path: "property",
  });
  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
agreementSchema.statics.findByIdStatics = async function (id) {
  const agreement = await this.findById(id);
  if (agreement) return agreement;
  throw errorResponse(404, "agreement not found");
};
/**
 *
 * * UPDATE
 *
 */
agreementSchema.statics.updateStatics = async function (req) {
  const { agreement, body } = req;

  const updated = await agreement.updateOne(body);
  if (updated.acknowledged)
    return this.findById(agreement._id).populate({ path: "property" });
  throw errorResponse(404, "could not update agreement");
};
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 * * EXPORT MODEL
 */
const agreementModel = mongoose.model("Agreement", agreementSchema);
export default agreementModel;
