import mongoose from "mongoose";
import { config } from "../config/index.js";

// database settings
(async function () {
  try {
    await mongoose.connect(config.database.uri);
  } catch (error) {
    console.error(error);
  }
})();

mongoose.connection.once("open", () =>
  console.log("Mongoose: Connected database")
);
mongoose.connection.on("error", (err) => console.log(err));
