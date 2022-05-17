import { Router } from "express";
import {
  createAgreement,
  getAllAgreement,
  getAllAgreementByProperty,
  getAgreementById,
  getOneAgreement,
  updateAgreement,
  deleteAgreement,
} from "../controllers/agreement.controller.js";

const router = Router();

router.route("/api/agreement").post(createAgreement).get(getAllAgreement);

router.param("id", getAgreementById);

router
  .route("/api/agreement/:id")
  .get(getOneAgreement)
  .put(updateAgreement)
  .delete(deleteAgreement);

router.get("/api/agreement/property/:property", getAllAgreementByProperty);

export default router;
