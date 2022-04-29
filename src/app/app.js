import express from "express";

// environment
import "./environment.js";
// database
import "./database.js";

const app = express();
// middleware

// routes
app.get("/", (req, res) => {
  res.send("hola mundo");
});

export default app;
