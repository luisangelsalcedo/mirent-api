import { Router } from "express";

const router = Router();

// agreementCtrl create
router.post("/api/agreement", (req, res) => {
  res.send("create");
});

// agreementCtrl getAll
router.get("/api/agreement", (req, res) => {
  res.send("getAll");
});

// agreementCtrl getById
router.get("/api/agreement/:id", (req, res) => {
  res.send("getById");
});

// agreementCtrl updateById
router.put("/api/agreement/:id", (req, res) => {
  res.send("updateById");
});

// agreementCtrl deleteById
router.delete("/api/agreement/:id", (req, res) => {
  res.send("deleteById");
});

//
export default router;
