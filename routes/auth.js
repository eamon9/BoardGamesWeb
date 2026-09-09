import express from "express";
import User from "../models/User.js"; // User model for MongoDB
import bcrypt from "bcrypt"; // Password hashing
import {
  loginRateLimiter,
  recordFailedAttempt,
  clearAttempts,
} from "../middleware/loginRateLimiter.js";

const router = express.Router();

router.get("/login", (req, res) => {
  req.session.returnTo = req.get("referer") || "/"; // Store referer for redirect
  res.render("auth/login");
});

router.post("/login", loginRateLimiter, async (req, res) => {
  const {username, password} = req.body;

  // Check for existing session
  if (req.session.user) {
    return res.redirect(req.session.returnTo || "/");
  }

  // Validate inputs
  if (!username || !password) {
    req.flash("error", "Lietotājvārds un parole ir obligāti");
    return res.redirect("/auth/login");
  }

  try {
    const user = await User.findOne({username});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      recordFailedAttempt(req._rateLimitKey);
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect("/auth/login");
    }

    clearAttempts(req._rateLimitKey);

    req.session.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        req.flash("error", "Pieslēgšanās kļūda");
        return res.redirect("/auth/login");
      }
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
