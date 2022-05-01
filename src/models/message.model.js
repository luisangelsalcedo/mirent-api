import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: Schema.Types.ObjectId, ref: "User" },
    message: String,
    created: Date,
    notice: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const messageModel = mongoose.model("Message", schema);
export default messageModel;
