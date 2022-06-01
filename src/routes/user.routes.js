import { Router } from "express";
import { getAllPropertyByOccupant } from "../controllers/property.controller.js";
import {
  login,
  createUser,
  tokenAuth,
  recoverPassword,
  getUserById,
  getOneUser,
  updateUser,
  deleteUser,
  inviteUser,
  sendInviteUser,
} from "../controllers/user.controller.js";

const userRouter = Router();

// login
userRouter.post("/auth/local/login", login);

// create a new user
userRouter.post("/auth/local/register", createUser);

// validate user authentication token
userRouter.get("/auth/local/validate/:token", tokenAuth);

// validate user authentication token
userRouter.post("/auth/local/recover/", recoverPassword);

// users endpoint
userRouter.param("id", getUserById);
userRouter
  .route("/api/user/:id")
  .get(getOneUser)
  .put(updateUser)
  .delete(deleteUser);
userRouter.post("/api/user/:id/invitation", inviteUser);
userRouter.post("/api/user/:id/sendinvitation", sendInviteUser);
userRouter.get("/api/user/:id/property", getAllPropertyByOccupant);

export default userRouter;
