import express from "express";
import Game from "../models/game.js";

const router = express.Router();

// Pievienot jaunu vērtējumu
router.post("/game/:id/ratings/new", async (req, res) => {
  const {name, score, comment} = req.body;
  const game = await Game.findById(req.params.id);
  game.ratings.push({name, score: parseFloat(score), comment});
  await game.save();
  res.redirect(`/game/${game._id}`);
});

// Rediģēt esošu vērtējumu
router.post("/game/:id/ratings/:index/edit", async (req, res) => {
  const {name, score, comment} = req.body;
  const game = await Game.findById(req.params.id);
  const idx = parseInt(req.params.index);
  if (game.ratings[idx]) {
    game.ratings[idx] = {name, score: parseFloat(score), comment};
    await game.save();
  }
  res.redirect(`/game/${game._id}`);
});

// Dzēst vērtējumu
router.get("/game/:id/ratings/:index/delete", async (req, res) => {
  const game = await Game.findById(req.params.id);
  const idx = parseInt(req.params.index);
  if (game.ratings[idx]) {
    game.ratings.splice(idx, 1);
    await game.save();
  }
  res.redirect(`/game/${game._id}`);
});

export default router;
