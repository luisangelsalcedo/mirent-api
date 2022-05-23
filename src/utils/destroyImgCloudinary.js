import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
  secure: true,
});

export const destroyImgCloudinary = (cldID) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(cldID, function (error, result) {
      if (error) reject(error);
      else resolve(result);
    });
  });
