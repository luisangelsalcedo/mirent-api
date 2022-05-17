import mongoose from "mongoose";

export const agreementDefaultStatus = {
  disabled: false,
  active: false,
  archived: false,
};

const { Schema } = mongoose;
const agreementSchema = new Schema(
  {
    status: {
      type: Object,
      default: { ...agreementDefaultStatus, disabled: true },
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "is required"],
    },
    occupant: { type: Schema.Types.ObjectId, ref: "User" },
    startdate: Date,
    enddate: Date,
    details: {
      type: String,
      trim: true,
    },
    sign: { type: Boolean, default: false },
    rents: [{ type: Schema.Types.ObjectId, ref: "Rent" }],
    notification: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default agreementSchema;
