import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    image: String,
    auth0: Boolean,
    dni: String,
    phone: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const userModel = mongoose.model("User", schema);
export default userModel;
