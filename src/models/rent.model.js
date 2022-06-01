import mongoose from "mongoose";
import moment from "moment";
import Stripe from "stripe";
import { config } from "../config/index.js";
import { rentSchema, rentDefaultStatus } from "../schemas/index.js";
import {
  errorResponse,
  objectPropertyExiste,
  getPropertyByID,
} from "../utils/index.js";

/**
 *
 * validamos que la fecha de pago sea mayor a la actual (now)
 *
 */
rentSchema.path("paydate").validate({
  validator(paydate) {
    return moment().format("x") < moment(paydate).format("x");
  },
  message: "pay date must not be earlier than today",
});
/**
 *
 * Valida que la cantidad sea solo números
 *
 */
rentSchema.path("amount").validate({
  async validator(amount) {
    return Number(amount);
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
 * * MIDDLEWARE SAVE
 * verificamos que la propiedad tenga estado rentado para generar una renta
 *
 */
rentSchema.pre("save", async function (next) {
  const { _id: rentID, property: propertyID } = this;
  const property = await getPropertyByID(propertyID);

  if (!property.status.rented)
    throw errorResponse(403, "sign the agreement to generate an rent");
});
/**
 *
 *  Creamos el name por defecto
 *
 */
rentSchema.pre("save", function (next) {
  const date = moment(this.paydate).format("LL");
  if (!this.name) this.name = `Rent ${date}`;
  next();
});
/**
 *
 * guardamos la renta en la propiedad
 *
 */
rentSchema.post("save", async function (rent) {
  const { _id: rentID, property: propertyID } = rent;
  const property = await getPropertyByID(propertyID);

  const arr = [...property.rents, rentID];
  await property.updateOne({ rents: arr });
});
/**
 *
 * * MIDDLEWARE REMOVE
 *  solo elimina rentas pendientes
 *
 */
rentSchema.pre("remove", function (next) {
  if (this.status.paymented)
    throw errorResponse(403, "this payment has already been made");
  next();
});
/**
 *  eliminamos la renta en la propiedad
 */
rentSchema.post("remove", async function (rent) {
  const { _id: rentID, property: propertyID } = rent;
  const property = await getPropertyByID(propertyID);

  const arr = [...property.rents].filter((r) => String(r) !== String(rentID));
  await property.updateOne({
    rents: arr,
  });
});
/**
 *
 * * MIDDLEWARE UPDATE
 * valida que existan elementos para actualizar
 * creamos una propiedad body donde incertamos los datos que vamos a actualizar
 *
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
 *
 * valida que NO se pueda editar la propiedad
 *
 */
rentSchema.pre("updateOne", function (next) {
  const { property } = this.body;
  if (property) throw errorResponse(403, "property can not be modify");
  next();
});
/**
 *
 * buscamos el documento rent que vamos a actualizar y validamos según su estado
 * PENDIENTE: se puede editar todos los campos
 * PAGADO: no se puede editar
 * EXPIRADO: solo se puede editar el estado
 *
 */
rentSchema.pre("updateOne", async function (next) {
  const rent = await this.model.findOne(this._conditions);
  this.rent = rent;
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
    const { status, stripe, paid, ...res } = this.body;
    if (Object.keys(res).length)
      throw errorResponse(403, "cannot be modified, switch to pending to edit");
    next();
  }
});
/**
 *
 * actualizamos el estado basandonos en la lista de estados por defecto
 *
 */
rentSchema.pre("updateOne", function (next) {
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
rentSchema.statics.createStatics = async function (req) {
  const { params, body } = req;
  const { id: propertyID } = params;

  Object.assign(body, { property: propertyID });
  const newDoc = body;
  const rent = await this.create(newDoc);
  if (rent) return rent.populate("property");
  throw errorResponse(500, "rent was not created");
};
/**
 *
 * * FIND ALL BY PROPERTY
 *
 */
rentSchema.statics.getAllStatics = async function (req) {
  const { id: propertyID } = req.params;
  const arr = await this.find({ property: propertyID }).populate({
    path: "property",
  });

  return arr;
};
/**
 *
 * * FIND BY ID
 *
 */
rentSchema.statics.findByIdStatics = async function (id) {
  const rent = await this.findById(id).populate({
    path: "property",
  });
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
  const updated = await rent.updateOne(body, { runValidators: true });
  if (updated.acknowledged)
    return this.findById(rent._id).populate({
      path: "property",
    });
  throw errorResponse(404, "could not update rent");
};
/**
 *
 * * UPDATE
 *
 */
const stripe = new Stripe(config.stripe.secretKey);

rentSchema.statics.pay = async function (req) {
  const { body, rent } = req;
  const { id } = body;

  if (rent.status.paymented)
    throw errorResponse(403, "this payment has already been made");

  const { name: occupant, dni } = await mongoose
    .model("User")
    .findById(rent.property.occupant);

  const { amount, name, details } = rent;

  const paymentObj = {
    amount: amount * 100,
    currency: "USD",
    description: `${rent.property.name}: ${name} | ${occupant}, DNI:${dni} (${details})`,
    payment_method: id,
    confirm: true,
  };

  await stripe.paymentIntents.create(paymentObj);

  const update = {
    status: { paymented: true },
    paid: new Date(),
    stripe: paymentObj,
  };

  const updated = await rent.updateOne(update);
  if (updated.acknowledged)
    return this.findById(rent._id).populate({
      path: "property",
    });

  throw errorResponse(404, "could not update rent");
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
const rentModel = mongoose.model("Rent", rentSchema);
export default rentModel;
