import express from "express";
import {isAdmin} from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Game from "../models/game.js";

const router = express.Router();
router.use(isAdmin); // All routes require admin access

// List all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.render("admin/users", {
      users,
      user: req.session.user,
    });
  } catch (err) {
    console.error("❌ User list error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/admin/dashboard");
  }
});

// Admin dashboard
router.get("/dashboard", (req, res) => {
  res.render("admin/dashboard", {
    currentPage: "adminDashboard",
    user: req.session.user,
  });
});

// Toggle admin status
router.post("/users/:id/toggle-admin", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "Lietotājs nav atrasts");
      return res.redirect("/admin/users");
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    req.flash("success", `Lietotāja ${user.username} admin status mainīts`);
    res.redirect("/admin/users");
  } catch (err) {
    console.error("❌ Toggle admin error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/admin/users");
  }
});

// Delete user
router.post("/users/:id/delete", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      req.flash("error", "Lietotājs nav atrasts");
      return res.redirect("/admin/users");
    }
    req.flash("success", `Lietotājs ${user.username} dzēsts`);
    res.redirect("/admin/users");
  } catch (err) {
    console.error("❌ User delete error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/admin/users");
  }
});

// Manage games
router.get("/games", async (req, res) => {
  try {
    const games = await Game.find().lean();
    res.render("admin/games", {
      games,
      user: req.session.user,
    });
  } catch (err) {
    console.error("❌ Game list error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/admin/dashboard");
  }
});

export default router;
