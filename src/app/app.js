import express from "express";
import userRoutes from "../routes/user.routes.js";
import propertyRoutes from "../routes/property.routes.js";
import agreementRoutes from "../routes/agreement.routes.js";
import rentRoutes from "../routes/rent.routes.js";
import notificationRoutes from "../routes/notification.routes.js";
import { authentication } from "../middlewares/authentication.js";

// environment
import "./environment.js";
// database
import "./database.js";
// server
const app = express();
// middleware
app.use(express.json());
app.all("/api/*", authentication);
// routes
app.get("/", (req, res) => {
  res.send("miRent app");
});
app.use(userRoutes);
app.use(propertyRoutes);
app.use(agreementRoutes);
app.use(rentRoutes);
app.use(notificationRoutes);

export default app;
