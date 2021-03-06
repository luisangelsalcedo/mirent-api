// import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// config environments
const nodeEnv = process.env.NODE_ENV || "";
const varEnv = path.resolve(process.cwd(), `./env/${nodeEnv}.env`);
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

  gmail: {
    user: "seemc9@gmail.com",
    apipassword: process.env.GMAIL_APPS_PASSWORD,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
};
