import Rent from "../models/rent.model.js";
import { successResponse } from "../utils/index.js";
import { config } from "../config/index.js";

/**
 ##  createRent (by property)
 */
const createRent = async (req, res, next) => {
  try {
    const rent = await Rent.createStatics(req);
    successResponse(res, 201, "rent created", rent);
  } catch (error) {
    next(error);
  }
};
/**
 ##  getAllRent (by property)
 */
const getAllRent = async (req, res, next) => {
  try {
    const arrRents = await Rent.getAllStatics(req);
    if (!arrRents.length) successResponse(res, 204);
    else successResponse(res, 200, null, arrRents);
  } catch (error) {
    next(error);
  }
};
/**
 ##  getRentById
 */
const getRentById = async (req, res, next, id) => {
  try {
    const rent = await Rent.findByIdStatics(id);
    req.rent = rent;
    next();
  } catch (error) {
    next(error);
  }
};
/**
 ##  getOneRent
 */
const getOneRent = async (req, res, next) => {
  try {
    const { rent } = req;
    successResponse(res, 200, null, rent);
  } catch (error) {
    next(error);
  }
};
/**
 ##  updateRent
 */
const updateRent = async (req, res, next) => {
  try {
    const updated = await Rent.updateStatics(req);
    successResponse(res, 200, "rent updated", updated);
  } catch (error) {
    next(error);
  }
};
/**
 ##  deleteRent
 */
const deleteRent = async (req, res, next) => {
  try {
    const { rent } = req;
    const deleted = await rent.remove();
    successResponse(res, 200, "deleted rent", deleted);
  } catch (error) {
    next(error);
  }
};

const payRent = async (req, res, next) => {
  try {
    const paymented = await Rent.pay(req);
    successResponse(res, 200, "pay success", paymented);
  } catch (error) {
    next(error);
  }
};

export {
  createRent,
  getAllRent,
  getRentById,
  getOneRent,
  updateRent,
  deleteRent,
  payRent,
};
