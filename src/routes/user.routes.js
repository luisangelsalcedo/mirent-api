import { Router } from "express";

const router = Router();

// login
router.post("/auth/login", (req, res) => {
  res.send("login");
});

// create a new user
router.post("/auth/register", (req, res) => {
  res.send("create a new user");
});

// validate user authentication token
router.get("/auth/validate", (req, res) => {
  res.send("validate user authentication token");
});

//
export default router;
