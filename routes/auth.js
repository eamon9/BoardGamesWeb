import express from "express";
import User from "../models/User.js"; // User model for MongoDB
import bcrypt from "bcrypt"; // Password hashing

const router = express.Router();

router.get("/login", (req, res) => {
  req.session.returnTo = req.get("referer") || "/"; // Store referer for redirect
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  console.log("🔹 Login attempt:", username);

  // Check for existing session
  if (req.session.user) {
    console.log("🔹 User already logged in:", req.session.user.username);
    return res.redirect(req.session.returnTo || "/");
  }

  // Validate inputs
  if (!username || !password) {
    console.log("❌ Login failed: missing credentials");
    req.flash("error", "Lietotājvārds un parole ir obligāti");
    return res.redirect("/auth/login");
  }

  try {
    const user = await User.findOne({username});
    console.log("🔹 User found in DB:", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("❌ Login failed: wrong credentials");
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect("/auth/login");
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    console.log("🔹 Session user set:", req.session.user);

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        req.flash("error", "Pieslēgšanās kļūda");
        return res.redirect("/auth/login");
      }
      console.log("✅ Session saved, redirecting...");
      return res.redirect(req.session.returnTo || "/");
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid"); // Clear session cookie
    return res.redirect("login");
  });
});

export default router; // Exports router for use in app.js
