import { Router } from "express";
import { getAgreementById } from "../controllers/agreement.controller.js";
import {
  createRentByAgreement,
  getAllRentByAgreement,
  getRentById,
  getOneRent,
  updateRent,
  deleteRent,
} from "../controllers/rent.controller.js";

const router = Router();
router.param("agreement", getAgreementById);
router
  .route("/api/rent/agreement/:agreement")
  .post(createRentByAgreement)
  .get(getAllRentByAgreement);

router.param("id", getRentById);
router
  .route("/api/rent/:id")
  .get(getOneRent)
  .put(updateRent)
  .delete(deleteRent);

//
export default router;
