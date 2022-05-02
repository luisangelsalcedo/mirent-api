import { Router } from "express";
import * as notificationCtrl from "../controllers/notification.controller.js";

const router = Router();

// notificationCtrl create
router.post("/api/notification", notificationCtrl.create);

// notificationCtrl getAll
router.get("/api/notification", notificationCtrl.getAll);

// notificationCtrl getById
router.get("/api/notification/:id", notificationCtrl.getById);

// notificationCtrl updateById
router.put("/api/notification/:id", notificationCtrl.updateById);

// notificationCtrl deleteById
router.delete("/api/notification/:id", notificationCtrl.deleteById);

//
export default router;
