import app from "./app/app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log("run server http://localhost:5000");
});
