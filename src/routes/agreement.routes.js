import { Router } from "express";
import * as agreementCtrl from "../controllers/agreement.controller.js";

const router = Router();

// agreementCtrl create
router.post("/api/agreement", agreementCtrl.create);

// agreementCtrl getAll
router.get("/api/agreement", agreementCtrl.getAll);

// agreementCtrl getById
router.get("/api/agreement/:id", agreementCtrl.getById);

// agreementCtrl updateById
router.put("/api/agreement/:id", agreementCtrl.updateById);

// agreementCtrl deleteById
router.delete("/api/agreement/:id", agreementCtrl.deleteById);

//
export default router;
