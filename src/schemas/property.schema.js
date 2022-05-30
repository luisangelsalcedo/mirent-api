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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "is required"],
    },
    occupant: { type: Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      trim: true,
      required: [true, "is required"],
    },
    price: { type: String, required: [true, "is required"] },
    address: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    agreement: [{ type: Schema.Types.ObjectId, ref: "Agreement" }],
    rents: [{ type: Schema.Types.ObjectId, ref: "Rent" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default propertySchema;
