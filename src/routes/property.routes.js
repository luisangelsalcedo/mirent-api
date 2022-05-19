import { Router } from "express";
import {
  createProperty,
  getAllProperty,
  getPropertyById,
  getOneProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";

const router = Router();
router.route("/api/property").post(createProperty).get(getAllProperty);
router.param("id", getPropertyById);
router
  .route("/api/property/:id")
  .get(getOneProperty)
  .put(updateProperty)
  .delete(deleteProperty);

export default router;
