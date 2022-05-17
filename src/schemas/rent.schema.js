import mongoose from "mongoose";

export const rentDefaultStatus = {
  pending: true,
  paymented: true,
  expired: true,
};

const { Schema } = mongoose;
const rentSchema = new Schema(
  {
    paydate: Date,
    payment: { type: String, trim: true },
    details: { type: String, trim: true },
    status: { type: Object, default: { ...rentDefaultStatus, pending: true } },
    voucher: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default rentSchema;

// pending: estitar todo, delete:true, genera notifiacion
// paymented: no se puede editar, genera notificacion
// expired: editar estado, genera notificacion

// paydate: no se puede generar un pago con fecha pasada
