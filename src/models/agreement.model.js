import mongoose from "mongoose";
import moment from "moment";
import {
  errorResponse,
  objectPropertyExiste,
  getPropertyByID,
} from "../utils/index.js";
import { agreementSchema, agreementDefaultStatus } from "../schemas/index.js";

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
 * Validamos si el ocupante existe
 */
agreementSchema.path("occupant").validate({
  async validator(occupant) {
    return mongoose
      .model("User")
      .findById(occupant)
      .then((find) => find);
  },
  message: "occupant not found",
});
/**
 * validamos que el ocupante sea diferente que el propietario
 */
agreementSchema.path("occupant").validate({
  async validator(occupant) {
    let property;
    if (this.property) property = this.property;
    else property = this.agreement.property;

    return mongoose
      .model("Property")
      .findById(property)
      .then((find) => String(find.owner) !== String(occupant));
  },
  message: "occupant must be different from owner",
});
/**
 * validamos que la fecha de inicio sea mayor a la actual (now)
 */
agreementSchema.path("startdate").validate({
  validator(startdate) {
    return moment().format("x") < moment(startdate).format("x");
  },
  message: "start date must not be earlier than today",
});
/**
 * validamos que la fecha de final sea mayor que la de inicio
 */
agreementSchema.path("enddate").validate({
  validator(enddate) {
    let startdate;
    if (this.startdate) {
      startdate = this.startdate;
    } else {
      startdate = this.agreement.startdate;
    }
    return moment(startdate).format("x") < moment(enddate).format("x");
  },
  message: "end date greater than start date",
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
 * * MIDDLEWARE SAVE
 * guardamos el contrato en la propiedad
 *
 */
agreementSchema.post("save", async function (agreement) {
  const { _id: agreementID, property: propertyID } = agreement;
  const property = await getPropertyByID(propertyID);

  const arr = [...property.agreement, agreementID];
  await property.updateOne({
    status: { rented: true },
    agreement: arr,
  });
});
/**
 *
 * * MIDDLEWARE REMOVE
 *  valida que solo se pueda eliminar el contrato cuando este desabilitado o archivado
 *
 */
agreementSchema.pre("remove", function (next) {
  if (this.status.disabled || this.status.archived) next();
  throw errorResponse(
    403,
    "deactivate or archive the agreement before deleting"
  );
});
/**
 * eliminamos el contrato en la propiedad
 */
agreementSchema.post("remove", async function (agreement) {
  const { _id: agreementID, property: propertyID } = agreement;
  const property = await getPropertyByID(propertyID);

  const arr = [...property.agreement].filter(
    (a) => String(a) !== String(agreementID)
  );
  await property.updateOne({
    status: { maintenance: true },
    agreement: arr,
  });
});
/**
/**
 *
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde insertamos los datos que vamos a actualizar
 *
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
 *
 * valida que NO se pueda editar la propiedad
 *
 */
agreementSchema.pre("updateOne", function (next) {
  const { property } = this.body;
  if (property) throw errorResponse(403, "property can not be modify");
  next();
});
/**
 *
 * buscamos el documento agreement que vamos a actualizar y validamos según su estado
 * DESABILITADO: No se puede firmar está permitido lo demás
 * ACTIVO: Se puede modificar solo el estado, la firma y seleccionar el ocupante
 * FIRMADO: Se puede modificar solo el estado
 * ARCHIVADO: no se puede editar ningún campo
 *
 */
agreementSchema.pre("updateOne", async function (next) {
  const agreement = await this.model.findOne(this._conditions);
  this.agreement = agreement;
  const { disabled, active, signed, archived } = agreement.status;

  // DESABILITADO
  if (disabled) {
    const { sign } = this.body;
    if (sign)
      throw errorResponse(403, "activate the agreement to be able to sign it");
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
    const { status, ...res } = this.body;
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
 *
 * actualizamos el estado basandonos en la lista de estados por defecto
 *
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
  const { occupant, sign, details } = this.agreement;
  const { status } = this.body;

  if (status?.active) {
    if (!details) throw errorResponse(403, "details is required");
  }

  if (status?.signed) {
    if (!occupant) throw errorResponse(403, "occupant is required");
    if (!sign) throw errorResponse(403, "sign is required");
    next();
  }
  next();
});
/**
 * si archivamos el agreement cambiamos la propiedad vincuada a estado disponible (available)
 */
agreementSchema.post("updateOne", async function () {
  const { property: propertyID } = this.agreement;
  const { status } = this.body;

  if (status.archived) {
    const property = await getPropertyByID(propertyID);
    await property.updateOne({ status: { maintenance: true } });
  }
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
 * * CREATE BY PROPERTY
 *
 */
agreementSchema.statics.createStatics = async function (req) {
  const { params, body } = req;
  const { id: propertyID } = params;

  Object.assign(body, { property: propertyID });
  const newDoc = body;
  const agreement = await this.create(newDoc);
  if (agreement) return agreement.populate("property");
  throw errorResponse(500, "agreement was not created");
};
/**
 *
 * * GET ALL BY PROPERTY
 *
 */
agreementSchema.statics.findAllStatics = async function (req) {
  const { id: propertyID } = req.params;
  const arr = await this.find({ property: propertyID })
    .populate({
      path: "property",
    })
    .populate({
      path: "occupant",
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
    .populate({ path: "occupant" });

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

  const updated = await agreement.updateOne(body, { runValidators: true });
  if (updated.acknowledged)
    return this.findById(agreement._id)
      .populate({ path: "property" })
      .populate({ path: "occupant" });
  throw errorResponse(404, "could not update agreement");
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
 * * EXPORT MODEL
 */
const agreementModel = mongoose.model("Agreement", agreementSchema);
export default agreementModel;
