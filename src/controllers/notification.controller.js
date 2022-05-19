import Notification from "../models/notification.model.js";
import { successResponse } from "../utils/index.js";

const createNotificationByAgreement = async (req, res, next) => {
  try {
    const notificacion = await Notification.createByAgreementStatics(req);
    successResponse(res, 201, "notificacion created", notificacion);
  } catch (error) {
    next(error);
  }
};
const getAllNotificationByAgreement = async (req, res, next) => {
  try {
    const arrNotices = await Notification.getAllByAgreementStatics(req);
    if (!arrNotices.length) successResponse(res, 204);
    else successResponse(res, 200, null, arrNotices);
  } catch (error) {
    next(error);
  }
};
const getNotificacionById = async (req, res, next, id) => {
  try {
    const notification = await Notification.findById(id);
    req.notification = notification;
    next();
  } catch (error) {
    next(error);
  }
};
const updateNotification = async (req, res, next) => {
  try {
    const updated = await Notification.updateStatics(req);
    successResponse(res, 200, "notification updated", updated);
  } catch (error) {
    next(error);
  }
};
export {
  createNotificationByAgreement,
  getAllNotificationByAgreement,
  getNotificacionById,
  updateNotification,
};
