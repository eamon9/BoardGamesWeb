import dotenv from "dotenv";
dotenv.config(); // Ielādē .env failu

import express from "express";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import session from "express-session";
import flash from "connect-flash";
import MongoStore from "connect-mongo";

// Routes un middleware
import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import ratingsRoutes from "./routes/ratings.js";
import {attachUser} from "./middleware/authMiddleware.js";

// __dirname aizvietošana ESM vidē
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Pārbauda, vai .env mainīgais ir ielādēts
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGO_URI nav iestatīts .env failā!");
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET nav iestatīts .env failā!");
  process.exit(1);
}

// MongoDB savienojums
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 diena
    },
  })
);

app.use(flash());

// Res.locals user
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(attachUser);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/", ratingsRoutes);
app.use("/", indexRoutes);

// Mājaslapa
app.get("/", (req, res) => res.render("index"));

// Serveris
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Serveris darbojas uz porta " + PORT);
});
