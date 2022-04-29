import mongoose from "mongoose";

// database settings
(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error(error);
  }
})();

mongoose.connection.once("open", () => console.log("connected database"));
mongoose.connection.on("error", (err) => console.log(err));
