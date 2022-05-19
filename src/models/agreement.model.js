import mongoose from "mongoose";
import moment from "moment";
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
  this.agreement = agreement;
  const { disabled, active, signed, archived } = agreement.status;

  // DESABILITADO
  if (disabled) {
    const { sign, rents, notifications } = this.body;
    if (sign)
      throw errorResponse(403, "activate the agreement to be able to sign it");
    if (rents)
      throw errorResponse(403, "activate the agreement to make payments");
    if (notifications)
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
    const { status, rents, notifications, ...res } = this.body;
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
agreementSchema.pre("updateOne", function (next) {
  const { occupant, sign, startdate, enddate, details } = this.agreement;
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
 * startdate: Tiene que ser mayor a la fecha actual
 * enddate: contrato minimo 1 año
 */
agreementSchema.pre("updateOne", function (next) {
  const { startdate: thisStart } = this.agreement;
  const { startdate, enddate } = this.body;
  if (startdate) {
    const start = moment(startdate).format("x");
    if (start < Date.now())
      throw errorResponse(422, "the start date must not be earlier than today");
  }
  if (enddate) {
    const addYear = moment(thisStart).add(1, "years").format("x");
    const newAddYear = moment(startdate).add(1, "years").format("x");
    const end = moment(enddate).format("x");
    if (end < addYear || end < newAddYear)
      throw errorResponse(422, "Contract period of at least one year.");
  }
  next();
});
/**
 * Validamos si el ocupante existe
 * validamos que el ocupante sea diferente que el propietario
 */
agreementSchema.pre("updateOne", async function (next) {
  const { occupant } = this.body;
  const { property } = await this.agreement.populate("property");
  if (occupant) {
    const find = await mongoose.model("User").findById(occupant);
    if (!find) throw errorResponse(404, "occupant not found");

    if (String(property.owner) === String(occupant))
      throw errorResponse(403, "invalid occupant, choose another");
  }
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
  })
    .populate({
      path: "property",
    })
    .populate({
      path: "rents",
    })
    .populate({
      path: "notifications",
    });
  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
agreementSchema.statics.findByIdStatics = async function (id) {
  const agreement = await this.findById(id)
    .populate({ path: "property" })
    .populate({ path: "rents" })
    .populate({ path: "notifications" });
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
