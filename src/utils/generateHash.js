import bcrypt from "bcrypt";

export const generateHash = (payload) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(payload, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
