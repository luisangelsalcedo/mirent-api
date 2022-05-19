// import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// config environments
const nodeEnv = process.env.NODE_ENV || "";
const varEnv = path.resolve(process.cwd(), `${nodeEnv}.env`);
dotenv.config({
  path: varEnv,
});

// Main configurator
export const config = {
  port: "5000",
  database: {
    uri: process.env.MONGODB_URI,
  },
  token: {
    secret: process.env.TOKEN_SECRET,
  },
};
