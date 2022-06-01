import mongoose from "mongoose";

export const agreementDefaultStatus = {
  disabled: false,
  active: false,
  signed: false,
  archived: false,
};

const { Schema } = mongoose;
const agreementSchema = new Schema(
  {
    status: {
      type: Object,
      default: { ...agreementDefaultStatus, disabled: true },
    },
    startdate: { type: Date, required: [true, "is required"] },
    enddate: { type: Date, required: [true, "is required"] },
    details: {
      type: String,
      trim: true,
    },
    occupant: { type: Schema.Types.ObjectId, ref: "User" },
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    sign: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default agreementSchema;
