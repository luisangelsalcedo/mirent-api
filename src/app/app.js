import express from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes.js";
import propertyRoutes from "../routes/property.routes.js";
import agreementRoutes from "../routes/agreement.routes.js";
import rentRoutes from "../routes/rent.routes.js";
import notificationRoutes from "../routes/notification.routes.js";
import templateRouter from "../routes/template.routes.js";
import { authentication, errorHandler } from "../middlewares/index.js";

// database
import "./database.js";

// server
const app = express();

// middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
app.all("/api/*", authentication);

// template
app.set("view engine", "ejs");

// routes
app.use(templateRouter);
app.use(userRoutes);
app.use(propertyRoutes);
app.use(agreementRoutes);
app.use(rentRoutes);
app.use(notificationRoutes);

// error handler
app.use(errorHandler);

export default app;
