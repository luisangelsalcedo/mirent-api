import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property" },
    occupant: { type: Schema.Types.ObjectId, ref: "User" },
    startdate: Date,
    enddate: Date,
    active: { type: Boolean, default: false },
    details: String,
    rents: [{ type: Schema.Types.ObjectId, ref: "Rent" }],
    services: Array,
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    notification: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const agreementModel = mongoose.model("Agreement", schema);
export default agreementModel;
