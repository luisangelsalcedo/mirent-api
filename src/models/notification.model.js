import mongoose from "mongoose";
import { notificacionSchema } from "../schemas/index.js";
import { errorResponse } from "../utils/index.js";

/**
 * * CREATE
 */
notificacionSchema.statics.createByAgreementStatics = async function (req) {
  const { agreement, body } = req;

  if (!agreement?.status.signed)
    throw errorResponse(
      403,
      "if the contract is not signed, notification cannot be created"
    );

  const notification = await this.create({ ...body, agreement: agreement._id });
  if (!notification) throw errorResponse(500, "notification was not created");

  const arrNotifications = [...agreement.notifications, notification._id];
  await agreement.updateOne({ notifications: arrNotifications });
  return notification;
};
/**
 *
 * * FIND ALL
 *
 */
notificacionSchema.statics.getAllByAgreementStatics = async function (req) {
  const { agreement } = req;
  await agreement.populate("notifications");
  const arr = agreement.notifications;
  return arr;
};
/**
 * * UPDATE
 */
notificacionSchema.statics.updateStatics = async function (req) {
  const { notification } = req;

  if (!notification.viewed) {
    await notification.updateOne({ viewed: true });
  }
};
/**
 * /////////////////////////////////////////////////////////////////////////////
 */
/**
 * * EXPORT MODEL
 */
const notificationModel = mongoose.model("Notification", notificacionSchema);
export default notificationModel;
