import User from "../models/user.model.js";
import { successResponse } from "../utils/index.js";

/**
 * ## Login
 */
const login = async (req, res, next) => {
  try {
    const token = await User.userAuth(req);
    successResponse(res, 200, "user logged", token);
  } catch (error) {
    next(error);
  }
};

/**
 * ## createUser
 */
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    successResponse(res, 201, "user created", user);
  } catch (error) {
    next(error);
  }
};

/**
 * ## tokenAuth
 */
const tokenAuth = async (req, res, next) => {
  try {
    const payload = await User.verifyToken(req);
    successResponse(res, 200, "verified token", payload);
  } catch (error) {
    next(error);
  }
};

export { login, createUser, tokenAuth };
