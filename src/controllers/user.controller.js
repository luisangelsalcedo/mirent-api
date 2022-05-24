import User from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/index.js";

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

const recoverPassword = async (req, res, next) => {
  try {
    const token = await User.findUsername(req);
    successResponse(res, 200, "user found", token);
  } catch (error) {
    next(error);
  }
};
/**
 * ## getUserById
 */
const getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw errorResponse(404, "user not found");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ## getOneUser
 */
const getOneUser = async (req, res, next) => {
  try {
    const { user } = req;
    const { password, ...resto } = user._doc;
    successResponse(res, 200, null, resto);
  } catch (error) {
    next(error);
  }
};

/**
 * ## updateUser
 */
const updateUser = async (req, res, next) => {
  try {
    const updated = await User.updateStatics(req);
    const { password, ...resto } = updated._doc;
    successResponse(res, 200, "user has been updated", resto);
  } catch (error) {
    next(error);
  }
};

export {
  login,
  createUser,
  tokenAuth,
  recoverPassword,
  getUserById,
  getOneUser,
  updateUser,
};
