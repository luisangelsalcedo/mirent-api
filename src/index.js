import app from "./app/app.js";
import { config } from "./config/index.js";

const port = process.env.PORT || config.port;

app.listen(port, () => {
  console.log(`run server http://localhost:${port}`);
});
