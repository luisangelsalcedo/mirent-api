import mongoose from "mongoose";

export const rentDefaultStatus = {
  pending: false,
  paymented: false,
  expired: false,
};

const { Schema } = mongoose;
const rentSchema = new Schema(
  {
    status: { type: Object, default: { ...rentDefaultStatus, pending: true } },
    name: { type: String, trim: true },
    agreement: { type: Schema.Types.ObjectId, ref: "Agreement" },
    paydate: { type: Date, required: true },
    payouted: Date,
    payment: { type: Number, required: true, trim: true },
    details: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default rentSchema;
