import { Router } from "express";
import {
  getAgreementById,
  getOneAgreement,
  updateAgreement,
  deleteAgreement,
} from "../controllers/agreement.controller.js";

const router = Router();
router.param("id", getAgreementById);
router
  .route("/api/agreement/:id")
  .get(getOneAgreement)
  .put(updateAgreement)
  .delete(deleteAgreement);

export default router;
