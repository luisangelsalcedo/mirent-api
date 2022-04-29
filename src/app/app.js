import express from "express";

// environment

// database

const app = express();
// middleware

// routes
app.get("/", (req, res) => {
  res.send("hola mundo");
});

export default app;
