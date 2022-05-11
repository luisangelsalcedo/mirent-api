import { Router } from "express";
import {
  login,
  createUser,
  tokenAuth,
} from "../controllers/user.controller.js";

const userRouter = Router();

// login
userRouter.post("/auth/local/login", login);

// create a new user
userRouter.post("/auth/local/register", createUser);

// validate user authentication token
userRouter.get("/auth/local/validate/:token", tokenAuth);

//
export default userRouter;
