import { Router } from "express";

const templateRouter = Router();

templateRouter.get("/", (req, res) => {
  res.render("home.ejs");
});

export default templateRouter;
