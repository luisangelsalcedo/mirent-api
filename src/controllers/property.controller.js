import Property from "../models/property.model.js";
import { successResponse, errorResponse } from "../utils/index.js";

/**
 ##  createProperty
 */
const createProperty = async (req, res, next) => {
  try {
    const { id } = req.auth;
    const property = await Property.create({ ...req.body, owner: id });
    successResponse(res, 201, "property created", property);
  } catch (error) {
    next(error);
  }
};
/**
 * ## getAllProperty
 */
const getAllProperty = async (req, res, next) => {
  try {
    const arrPropertys = await Property.findAllStatics(req);
    successResponse(res, 200, null, arrPropertys);
  } catch (error) {
    next(error);
  }
};
/**
 * ## getPropertyById
 */
const getPropertyById = async (req, res, next, id) => {
  try {
    const property = await Property.findByIdStatics(id);
    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};
/**
 * ## getOneProperty
 */
const getOneProperty = async (req, res, next) => {
  try {
    const { property } = req;
    successResponse(res, 200, null, property);
  } catch (error) {
    next(error);
  }
};
/**
 * ## updateProperty
 */
const updateProperty = async (req, res, next) => {
  try {
    const updated = await Property.updateStatics(req);
    successResponse(res, 200, "property updated", updated);
  } catch (error) {
    next(error);
  }
};
/**
 * ## deleteProperty
 */
const deleteProperty = async (req, res, next) => {
  try {
    const { property } = req;
    const deleted = await property.remove();
    await deleted;

    successResponse(res, 200, "delected property", deleted);
  } catch (error) {
    next(error);
  }
};

const getAllPropertyByOccupant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const arrPropertys = await Property.find({ occupant: id })
      .populate({ path: "owner" })
      .populate({ path: "agreement" })
      .populate({ path: "rents" })
      .populate({ path: "notifications" });

    if (!arrPropertys.length) successResponse(res, 204);
    successResponse(res, 200, null, arrPropertys);
  } catch (error) {
    next(error);
  }
};

export {
  createProperty,
  getAllProperty,
  getPropertyById,
  getOneProperty,
  updateProperty,
  deleteProperty,
  getAllPropertyByOccupant,
};
