import mongoose from "mongoose";
import { expreg } from "../constant/index.js";

const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "is required"],
      unique: [true, "sasad"],
      match: [expreg.email, "invalid email address"],
    },
    password: {
      type: String,
      required: [true, "is required"],
    },
    image: {
      type: Object,
      default: {
        origin: null,
        imageId: null,
        thumb: null,
      },
    },
    dni: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default userSchema;
