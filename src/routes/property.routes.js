import { Router } from "express";

const router = Router();

// propertyCtrl create
router.post("/api/property", (req, res) => {
  res.send("create");
});

// propertyCtrl getAll
router.get("/api/property", (req, res) => {
  res.send("getAll");
});

// propertyCtrl getById
router.get("/api/property/:id", (req, res) => {
  res.send("getById");
});

// propertyCtrl updateById
router.put("/api/property/:id", (req, res) => {
  res.send("updateById");
});

// propertyCtrl deleteById
router.delete("/api/property/:id", (req, res) => {
  res.send("deleteById");
});

//
export default router;
