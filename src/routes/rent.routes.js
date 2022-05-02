import { Router } from "express";

const router = Router();

// rentCtrl create
router.post("/api/rent", (req, res) => {
  res.send("create");
});

// rentCtrl getAll
router.get("/api/rent", (req, res) => {
  res.send("getAll");
});

// rentCtrl getById
router.get("/api/rent/:id", (req, res) => {
  res.send("getById");
});

// rentCtrl updateById
router.put("/api/rent/:id", (req, res) => {
  res.send("updateById");
});

// rentCtrl deleteById
router.delete("/api/rent/:id", (req, res) => {
  res.send("deleteById");
});

//
export default router;
