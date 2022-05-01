import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    message: String,
    notice: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const messageModel = mongoose.model("Message", schema);
export default messageModel;
