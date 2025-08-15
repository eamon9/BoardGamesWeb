import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import flash from "connect-flash";
import helmet from "helmet";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import ratingsRoutes from "./routes/ratings.js";
import {attachUser} from "./middleware/authMiddleware.js";
import {createSessionMiddleware} from "./config/sessionConfig.js";

const app = express();

// ESM __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}

// Trust Render's proxy
app.set("trust proxy", 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net", // For Bootstrap JS
        ],
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net", // For Bootstrap CSS
          "'unsafe-inline'", // For inline styles (Bootstrap)
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://*.onrender.com",
          "https://images.bauerhosting.com", // Allow images from bauerhosting
        ],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [], // Enforce HTTPS
      },
    },
  })
);
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(createSessionMiddleware());
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error")[0];
  res.locals.success = req.flash("success")[0];
  res.locals.user = req.session.user || null;
  next();
});
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

// Homepage
app.get("/", (req, res) => res.render("index"));

// Debug route
app.get("/session-check", (req, res) => {
  console.log("!🔹 /session-check hit, session:", req.session);
  res.json({
    session: req.session,
    cookies: req.cookies,
    headers: req.headers,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).render("error", {error: "Something went wrong!"});
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
