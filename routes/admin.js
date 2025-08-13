import express from "express";
import {isAdmin} from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Game from "../models/game.js";

const router = express.Router();
router.use(isAdmin); // All routes in this file require admin

// List all users
// admin.js
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.render("admin/users", {
      users,
      user: req.session.user // <--- pievienots šeit
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

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
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete user
router.post("/users/:id/delete", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Manage games
router.get("/games", isAdmin, async (req, res) => {
  try {
    const games = await Game.find().lean(); // iegūst visas spēles no DB
    res.render("admin/games", {games, user: req.session.user});
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Pievienot jaunu vērtējumu
router.post('/game/:id/ratings/new', async (req, res) => {
  const { name, score, comment } = req.body;
  const game = await Game.findById(req.params.id);
  game.ratings.push({ name, score: parseFloat(score), comment });
  await game.save();
  res.redirect(`/game/${game._id}`);
});

// Rediģēt esošu vērtējumu
router.post('/game/:id/ratings/:index/edit', async (req, res) => {
  const { name, score, comment } = req.body;
  const game = await Game.findById(req.params.id);
  const idx = parseInt(req.params.index);
  if (game.ratings[idx]) {
    game.ratings[idx] = { name, score: parseFloat(score), comment };
    await game.save();
  }
  res.redirect(`/game/${game._id}`);
});

// Dzēst vērtējumu
router.get('/game/:id/ratings/:index/delete', async (req, res) => {
  const game = await Game.findById(req.params.id);
  const idx = parseInt(req.params.index);
  if (game.ratings[idx]) {
    game.ratings.splice(idx, 1);
    await game.save();
  }
  res.redirect(`/game/${game._id}`);
});

export default router;
