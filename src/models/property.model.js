import mongoose from "mongoose";

const { Schema } = mongoose;
const schema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    address: String,
    details: String,
    status: {
      type: Array,
      default: [
        { name: "Disponible", active: true },
        { name: "Reservado", active: false },
        { name: "Alquilado", active: false },
        { name: "Mantenimiento", active: false },
      ],
    },
    price: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const propertyModel = mongoose.model("Property", schema);
export default propertyModel;
