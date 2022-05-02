import { Router } from "express";
import * as rentCtrl from "../controllers/rent.controller.js";

const router = Router();

// rentCtrl create
router.post("/api/rent", rentCtrl.create);

// rentCtrl getAll
router.get("/api/rent", rentCtrl.getAll);

// rentCtrl getById
router.get("/api/rent/:id", rentCtrl.getById);

// rentCtrl updateById
router.put("/api/rent/:id", rentCtrl.updateById);

// rentCtrl deleteById
router.delete("/api/rent/:id", rentCtrl.deleteById);

//
export default router;
