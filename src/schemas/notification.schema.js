import mongoose from "mongoose";

const { Schema } = mongoose;
const notificacionSchema = new Schema(
  {
    message: {
      type: String,
      trim: true,
      required: [true, "is required"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "is required"],
    },
    viewed: { type: Boolean, default: false },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "is required"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default notificacionSchema;
