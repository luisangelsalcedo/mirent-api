import { Router } from "express";
import * as userCtrl from "../controllers/user.controller.js";

const router = Router();

// login
router.post("/auth/login", userCtrl.login);

// create a new user
router.post("/auth/register", userCtrl.register);

// validate user authentication token
router.get("/auth/validate", userCtrl.validate);

//
export default router;
