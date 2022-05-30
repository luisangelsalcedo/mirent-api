import { Router } from "express";
import { getAgreementById } from "../controllers/agreement.controller.js";
import {
  getNotificacionById,
  updateNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.param("id", getNotificacionById);
router.route("/api/notification/:id").put(updateNotification);

//
export default router;
