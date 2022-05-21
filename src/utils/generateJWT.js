import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

/**
 * ## generateJWT
 * ```js
 *generateJWT(payload, timer)
 * ```
 * @param {Object} payload
 * @param {String|Number} timer
 * @returns {Token}
 *
 * > **timer** :
 * > Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").
 */
export const generateJWT = (payload, timer = "1d") => {
  const promise = new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      config.token.secret,
      {
        expiresIn: timer,
      },
      (err, token) => {
        if (!err) resolve(token);
        else reject(err);
      }
    );
  });

  return promise;
};
