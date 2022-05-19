import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

/**
 * ## authentication
 * *
 */
export const authentication = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) {
    const token = auth.split("Bearer ").join("");

    // verificar token
    jwt.verify(token, config.token.secret, (err, dataAuth) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      //
      req.auth = dataAuth; // send data user auth
      next();
    });
    //
  } else res.status(401).json({ message: "Token required" });
};
