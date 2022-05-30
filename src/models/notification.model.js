import mongoose from "mongoose";
import { notificacionSchema } from "../schemas/index.js";
import { errorResponse } from "../utils/index.js";

// message

/**
 * * CREATE
 */
notificacionSchema.statics.createStatics = async function (req) {
  const { params, body, auth } = req;
  const { id: propertyID } = params;
  Object.assign(body, { property: propertyID, sender: auth.id });
  const newDoc = body;
  const notification = await this.create(newDoc);
  if (notification) return notification.populate("sender");
  throw errorResponse(500, "notification was not created");
};
/**
 *
 * * FIND ALL
 *
 */
notificacionSchema.statics.getAllStatics = async function (req) {
  const { id: propertyID } = req.params;
  const arr = await this.find({ property: propertyID }).populate({
    path: "sender",
  });

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
//
//
//
//
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ? ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
/**
 * * EXPORT MODEL
 */
const notificationModel = mongoose.model("Notification", notificacionSchema);
export default notificationModel;
