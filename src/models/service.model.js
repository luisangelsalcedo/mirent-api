import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: String,
    details: String,
    image: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const serviceModel = mongoose.model("Service", schema);
export default serviceModel;
