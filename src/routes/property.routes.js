import { Router } from "express";
import {
  createProperty,
  getAllProperty,
  getPropertyById,
  getOneProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";
import {
  createAgreement,
  getAllAgreement,
} from "../controllers/agreement.controller.js";
import {
  createNotification,
  getAllNotification,
} from "../controllers/notification.controller.js";
import { createRent, getAllRent } from "../controllers/rent.controller.js";

const router = Router();
router.route("/api/property").post(createProperty).get(getAllProperty);
router.param("id", getPropertyById);
router
  .route("/api/property/:id")
  .get(getOneProperty)
  .put(updateProperty)
  .delete(deleteProperty);

router
  .route("/api/property/:id/agreement")
  .post(createAgreement)
  .get(getAllAgreement);

router
  .route("/api/property/:id/notification")
  .post(createNotification)
  .get(getAllNotification);

router.route("/api/property/:id/rent").post(createRent).get(getAllRent);

export default router;
