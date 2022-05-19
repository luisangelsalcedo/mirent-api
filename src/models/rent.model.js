import mongoose from "mongoose";
import moment from "moment";
import { errorResponse, objectPropertyExiste } from "../utils/index.js";
import { rentSchema, rentDefaultStatus } from "../schemas/index.js";

/**
 * * VIRTUAL DAYSTOEXPIRED
 *  Creamos el name por defecto
 */
rentSchema.virtual("daysToExpired").get(function () {
  const pay = moment(this.paydate);
  const now = moment();
  const result = moment.duration(pay.diff(now)).days();
  return result;
});
/**
 * * VALIDATE
 *  Creamos el name por defecto
 */
rentSchema.path("paydate").validate({
  validator() {
    return this.daysToExpired >= -2;
  },
  message: "pay date must not be earlier than two days from today",
});
/**
 * * MIDDLEWARE SAVE
 *  Creamos el name por defecto
 */
rentSchema.pre("save", function (next) {
  const date = moment(this.paydate).format("LL");
  this.name ??= `Rent ${date}`;
  next();
});
/**
 * * MIDDLEWARE REMOVE
 *  solo elimina rentas pendientes
 */
rentSchema.pre("remove", function (next) {
  if (this.status.pending) next();
  throw errorResponse(403, "only unpaid rents can be deleted");
});
/**
 *  Despues de eliminar la renta, la elimina del contrato
 */
rentSchema.post("remove", async function (rent) {
  const agreement = await mongoose.model("Agreement").findById(rent.agreement);
  const arrRents = agreement.rents.filter(
    (r) => String(r) !== String(rent._id)
  );

  await agreement.updateOne({ rents: arrRents });
});
/**
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde incertamos los datos que vamos a actualizar
 */
rentSchema.pre("updateOne", function (next) {
  if (this._update) {
    const { $set, $setOnInsert, ...res } = this._update;
    this.body = res;
    next();
  }
  throw errorResponse(422, "empty content");
});
/**
 * valida que NO se pueda editar la referencia al contrato
 */
rentSchema.pre("updateOne", function (next) {
  const { agreement } = this.body;
  if (agreement) throw errorResponse(403, "agreement can not be modify");
  next();
});

/**
 * buscamos el documento rent que vamos a actualizar y validamos según su estado
 * PENDIENTE: se puede editar todos los campos
 * PAGADO: no se puede editar
 * EXPIRADO: solo se puede editar el estado
 */
rentSchema.pre("updateOne", async function (next) {
  const rent = await this.model.findOne(this._conditions);
  const { pending, paymented, expired } = rent.status;

  // PENDIENTE
  if (pending) {
    next();
  }

  // PAGADO
  if (paymented) {
    throw errorResponse(403, "you can not modify a rent paid");
  }

  // EXPIRADO
  if (expired) {
    const { status, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "cannot be modified, switch to pending to edit");
    next();
  }
});
/**
 * actualizamos el estado basandonos en la lista de estados por defecto
 */
rentSchema.pre("updateOne", async function (next) {
  const { status } = this._update;
  if (status) {
    const key = Object.keys(status)[0];
    if (!objectPropertyExiste(rentDefaultStatus, key))
      throw errorResponse(422, `'${key}' state you want to set does not exist`);

    const updated = { ...rentDefaultStatus, ...status };
    this._update.status = updated;
  }
  next();
});
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 *
 * * CREATE
 * validar agreement status ACTIVO
 * registra la renta en el contrato luego de crearlo
 *
 */
rentSchema.statics.createByAgreementStatics = async function (req) {
  const { agreement, body } = req;

  if (!agreement.status.signed)
    throw errorResponse(500, "sign the agreement to generate an rent");

  const rent = await this.create({ ...body, agreement: agreement._id });
  if (!rent) throw errorResponse(500, "rent was not created");

  const arrRents = [...agreement.rents, rent._id];
  await agreement.updateOne({ rents: arrRents });
  return rent;
};
/**
 *
 * * FIND ALL
 *
 */
rentSchema.statics.getAllByAgreementStatics = async function (req) {
  const { agreement } = req;
  await agreement.populate("rents");
  const arr = agreement.rents;
  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
rentSchema.statics.findByIdStatics = async function (id) {
  const rent = await this.findById(id);
  if (rent) return rent;
  throw errorResponse(404, "rent not found");
};
/**
 *
 * * UPDATE
 *
 */
rentSchema.statics.updateStatics = async function (req) {
  const { rent, body } = req;
  const updated = await rent.updateOne(body);
  if (updated.acknowledged) return this.findById(rent._id);
  throw errorResponse(404, "could not update rent");
};
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 * * EXPORT MODEL
 */
const rentModel = mongoose.model("Rent", rentSchema);
export default rentModel;
