import dotenv from "dotenv";
import path from "path";

// environment settings
const nodeEnv = process.env.NODE_ENV || "";
const varEnv = path.resolve(process.cwd(), `${nodeEnv}.env`);

dotenv.config({ path: varEnv });
