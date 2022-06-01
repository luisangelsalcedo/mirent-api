import mongoose from "mongoose";

export const rentDefaultStatus = {
  pending: false,
  paymented: false,
  expired: false,
};

const { Schema } = mongoose;
const rentSchema = new Schema(
  {
    status: {
      type: Object,
      default: { ...rentDefaultStatus, pending: true },
    },
    name: {
      type: String,
      trim: true,
    },
    paydate: {
      type: Date,
      required: [true, "is required"],
    },
    paid: Date,
    amount: {
      type: String,
      required: [true, "is required"],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "is required"],
    },
    stripe: {
      type: Object,
      default: {
        id: null,
        amount: null,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default rentSchema;
