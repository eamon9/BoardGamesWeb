import express from "express";
import path from "path";
import {fileURLToPath} from "url";
import indexRoutes from "./routes/index.js";

const app = express();

// __dirname aizvietošana ESM vidē
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Maršruti
app.use("/", indexRoutes);

// Serveris
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveris darbojas uz porta " + PORT);
});
