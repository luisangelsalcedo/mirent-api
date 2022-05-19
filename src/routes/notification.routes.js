import { Router } from "express";
import { getAgreementById } from "../controllers/agreement.controller.js";
import {
  createNotificationByAgreement,
  getAllNotificationByAgreement,
  getNotificacionById,
  updateNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.param("agreement", getAgreementById);
router
  .route("/api/notification/agreement/:agreement")
  .post(createNotificationByAgreement)
  .get(getAllNotificationByAgreement);

router.param("id", getNotificacionById);
router.route("/api/notification/:id").put(updateNotification);

//
export default router;
