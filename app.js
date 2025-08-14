import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import flash from "connect-flash";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import ratingsRoutes from "./routes/ratings.js";
import {attachUser} from "./middleware/authMiddleware.js";
import {createSessionMiddleware} from "./config/sessionConfig.js";

const app = express();

// __dirname aizvietošana ESM vidē
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB savienojums
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

// Middleware
const sessionMiddleware = createSessionMiddleware();
app.use(sessionMiddleware);

app.use(flash());

// Flash un user objekta pievienošana visiem view
app.use((req, res, next) => {
  res.locals.error = req.flash("error")[0];
  res.locals.success = req.flash("success")[0];
  res.locals.user = req.session.user || null;
  console.log("🔹 res.locals.user:", res.locals.user);
  next();
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(attachUser);

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/", ratingsRoutes);
app.use("/", indexRoutes);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Mājaslapa
app.get("/", (req, res) => res.render("index"));

// Route for debugging
app.get("/session-check", (req, res) => {
  console.log("🔹 /session-check hit, session:", req.session);
  res.json({
    session: req.session,
    cookies: req.cookies,
    headers: req.headers,
  });
});

// Serveris
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Serveris darbojas uz porta ${PORT}`)
);
