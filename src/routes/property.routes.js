import { Router } from "express";
import * as propertyCtrl from "../controllers/property.controller.js";

const router = Router();

// propertyCtrl create
router.post("/api/property", propertyCtrl.create);

// propertyCtrl getAll
router.get("/api/property", propertyCtrl.getAll);

// propertyCtrl getById
router.get("/api/property/:id", propertyCtrl.getById);

// propertyCtrl updateById
router.put("/api/property/:id", propertyCtrl.updateById);

// propertyCtrl deleteById
router.delete("/api/property/:id", propertyCtrl.deleteById);

//
export default router;
