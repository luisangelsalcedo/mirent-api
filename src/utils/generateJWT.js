import jwt from "jsonwebtoken";

/**
 *
 * @param {Object} payload
 * @returns
 */
export const generateJWT = (payload) => {
  const promise = new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_PASSWORD,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (!err) resolve(token);
        else reject();
      }
    );
  });

  return promise;
};
