import express from "express";
import userRoutes from "../routes/user.routes.js";
import propertyRoutes from "../routes/property.routes";
import agreementRoutes from "../routes/agreement.routes";
import rentRoutes from "../routes/rent.routes";
import notificationRoutes from "../routes/notification.routes";

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
app.use(userRoutes);
app.use(propertyRoutes);
app.use(agreementRoutes);
app.use(rentRoutes);
app.use(notificationRoutes);

export default app;
