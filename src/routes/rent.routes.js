import { Router } from "express";
import {
  getRentById,
  getOneRent,
  updateRent,
  deleteRent,
} from "../controllers/rent.controller.js";

const router = Router();
router.param("id", getRentById);
router
  .route("/api/rent/:id")
  .get(getOneRent)
  .put(updateRent)
  .delete(deleteRent);

export default router;
