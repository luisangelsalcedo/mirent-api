import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    paydate: Date,
    payment: Number,
    details: String,
    status: {
      type: Array,
      default: [
        { name: "Generado", active: true },
        { name: "Pagado", active: false },
        { name: "Deuda", active: false },
        { name: "Anulado", active: false },
      ],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const rentModel = mongoose.model("Rent", schema);
export default rentModel;
