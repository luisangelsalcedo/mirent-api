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

/**
 * ## findById
 */
const findById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!User) throw errorResponse(404, "user not found");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ## findOneUser
 */
const findOneUser = async (req, res, next) => {
  try {
    const { user } = req;
    successResponse(res, 200, null, user);
  } catch (error) {
    next(error);
  }
};

/**
 * ## updateUser
 */
const updateUser = async (req, res, next) => {
  try {
    const updated = await User.updateUser(req);
    successResponse(res, 200, "user has been updated", updated);
  } catch (error) {
    next(error);
  }
};

export { login, createUser, tokenAuth, findById, findOneUser, updateUser };
