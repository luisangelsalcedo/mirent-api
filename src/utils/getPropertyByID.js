import mongoose from "mongoose";

export const getPropertyByID = async (id) => {
  const property = await mongoose.model("Property").findById(id);
  return property;
};
