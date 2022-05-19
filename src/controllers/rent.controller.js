import { successResponse } from "../utils/index.js";
import Rent from "../models/rent.model.js";

const createRentByAgreement = async (req, res, next) => {
  try {
    const rent = await Rent.createByAgreementStatics(req);
    successResponse(res, 201, "rent created", rent);
  } catch (error) {
    next(error);
  }
};
const getAllRentByAgreement = async (req, res, next) => {
  try {
    const arrRents = await Rent.getAllByAgreementStatics(req);
    if (!arrRents.length) successResponse(res, 204);
    else successResponse(res, 200, null, arrRents);
  } catch (error) {
    next(error);
  }
};
const getRentById = async (req, res, next, id) => {
  try {
    const rent = await Rent.findByIdStatics(id);
    req.rent = rent;
    next();
  } catch (error) {
    next(error);
  }
};
const getOneRent = async (req, res, next) => {
  try {
    const { rent } = req;
    successResponse(res, 200, null, rent);
  } catch (error) {
    next(error);
  }
};
const updateRent = async (req, res, next) => {
  try {
    const updated = await Rent.updateStatics(req);
    successResponse(res, 200, "rent updated", updated);
  } catch (error) {
    next(error);
  }
};
const deleteRent = async (req, res, next) => {
  try {
    const { rent } = req;
    const deleted = await rent.remove();
    successResponse(res, 200, "deleted rent", deleted);
  } catch (error) {
    next(error);
  }
};

export {
  createRentByAgreement,
  getAllRentByAgreement,
  getRentById,
  getOneRent,
  updateRent,
  deleteRent,
};
