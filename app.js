import "dotenv/config";
import express from "express";
import path from "path";
import {fileURLToPath} from "url";
import indexRoutes from "./routes/index.js";
import connectDB from "./config/db.js";
import session from "express-session";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import flash from "connect-flash";
import profileRoutes from "./routes/profile.js";
import { attachUser } from "./middleware/authMiddleware.js";
import ratingsRoutes from "./routes/ratings.js";
//import adminGamesRoutes from "./routes/admin/games.js";
//import adminUsersRoutes from "./routes/admin/users.js";
//import adminDashboardRoutes from "./routes/admin/dashboard.js";

const app = express();

// __dirname aizvietošana ESM vidē
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "jūsu_parole",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 diena
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // HTML formām
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // JSON datiem

app.use(attachUser);

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/", ratingsRoutes);

//app.use("/admin/games", adminGamesRoutes);
//app.use("/admin/users", adminUsersRoutes);
//app.use("/admin/dashboard", adminDashboardRoutes);

// Maršruti
app.use("/", indexRoutes);

// Mājaslapa
app.get("/", (req, res) => res.render("index"));

// Serveris
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Serveris darbojas uz porta " + PORT);
});
