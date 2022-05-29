import mongoose from "mongoose";

export const propertyDefaultStatus = {
  maintenance: false,
  available: false,
  rented: false,
};

const { Schema } = mongoose;
const propertySchema = new Schema(
  {
    status: {
      type: Object,
      default: { ...propertyDefaultStatus, maintenance: true },
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      trim: true,
      required: [true, "is required"],
    },
    address: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    price: Number,
    agreement: { type: Schema.Types.ObjectId, ref: "Agreement" },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default propertySchema;
