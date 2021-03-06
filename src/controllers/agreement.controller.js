import Agreement from "../models/agreement.model.js";
import { successResponse, errorResponse } from "../utils/index.js";

/**
 ##  createAgreement (by property)
 */
const createAgreement = async (req, res, next) => {
  try {
    const agreement = await Agreement.createStatics(req);
    successResponse(res, 201, "agreement created", agreement);
  } catch (error) {
    next(error);
  }
};

/**
 * ## getAllAgreement (by property)
 */
const getAllAgreement = async (req, res, next) => {
  try {
    const arrAgreement = await Agreement.findAllStatics(req);

    if (!arrAgreement.length) successResponse(res, 204);
    else successResponse(res, 200, null, arrAgreement);
  } catch (error) {
    next(error);
  }
};
/**
 * ## getAgreementById
 */
const getAgreementById = async (req, res, next, id) => {
  try {
    const agreement = await Agreement.findByIdStatics(id);
    req.agreement = agreement;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ## getOneAgreement
 */
const getOneAgreement = async (req, res, next) => {
  try {
    const { agreement } = req;
    successResponse(res, 200, null, agreement);
  } catch (error) {
    next(error);
  }
};
/**
 * ## updateAgreement
 */
const updateAgreement = async (req, res, next) => {
  try {
    const updated = await Agreement.updateStatics(req);
    successResponse(res, 200, "agreement updated", updated);
  } catch (error) {
    next(error);
  }
};
/**
 * ## deleteAgreement
 */
const deleteAgreement = async (req, res, next) => {
  try {
    const { agreement } = req;
    const deleted = await agreement.remove();
    await deleted.populate("property");
    successResponse(res, 200, "deleted agreement", deleted);
  } catch (error) {
    next(error);
  }
};

export {
  createAgreement,
  getAllAgreement,
  getAgreementById,
  getOneAgreement,
  updateAgreement,
  deleteAgreement,
};
