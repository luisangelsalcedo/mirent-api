import { Router } from "express";

const router = Router();

// notificationCtrl create
router.post("/api/notification", (req, res) => {
  res.send("create");
});

// notificationCtrl getAll
router.get("/api/notification", (req, res) => {
  res.send("getAll");
});

// notificationCtrl getById
router.get("/api/notification/:id", (req, res) => {
  res.send("getById");
});

// notificationCtrl updateById
router.put("/api/notification/:id", (req, res) => {
  res.send("updateById");
});

// notificationCtrl deleteById
router.delete("/api/notification/:id", (req, res) => {
  res.send("deleteById");
});

//
export default router;
