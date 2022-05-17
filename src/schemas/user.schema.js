import mongoose from "mongoose";

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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/,
        "invalid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "is required"],
    },
    image: String,
    auth0: Boolean,
    dni: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export default userSchema;
