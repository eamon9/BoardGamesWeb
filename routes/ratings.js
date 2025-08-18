import express from "express";
import {body, validationResult} from "express-validator";
import Game from "../models/game.js";
import {isAuthenticated, isAdmin} from "../middleware/authMiddleware.js";

const router = express.Router();

// Add new rating (authenticated users)
router.post(
  "/game/:id/ratings/new",
  isAuthenticated,
  [
    body("name").trim().notEmpty().withMessage("Vārds ir obligāts"),
    body("score")
      .isFloat({min: 0, max: 10})
      .withMessage("Vērtējumam jābūt no 0 līdz 10"),
    body("comment").trim().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(`/game/${req.params.id}`);
    }

    try {
      const {name, score, comment} = req.body;
      const game = await Game.findById(req.params.id);
      if (!game) {
        req.flash("error", "Spēle nav atrasta");
        return res.redirect("/");
      }
      game.ratings.push({name, score: parseFloat(score), comment});
      await game.save();
      req.flash("success", "Vērtējums pievienots");
      res.redirect(`/game/${game._id}`);
    } catch (err) {
      console.error("❌ Rating add error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect(`/game/${req.params.id}`);
    }
  }
);

// Edit existing rating (admins only)
router.post(
  "/game/:id/ratings/:index/edit",
  isAdmin,
  [
    body("name").trim().notEmpty().withMessage("Vārds ir obligāts"),
    body("score")
      .isFloat({min: 0, max: 10})
      .withMessage("Vērtējumam jābūt no 0 līdz 10"),
    body("comment").trim().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(`/game/${req.params.id}`);
    }

    try {
      const {name, score, comment} = req.body;
      const game = await Game.findById(req.params.id);
      if (!game) {
        req.flash("error", "Spēle nav atrasta");
        return res.redirect("/");
      }
      const idx = parseInt(req.params.index);
      if (game.ratings[idx]) {
        game.ratings[idx] = {name, score: parseFloat(score), comment};
        await game.save();
        req.flash("success", "Vērtējums atjaunināts");
      } else {
        req.flash("error", "Vērtējums nav atrasts");
      }
      res.redirect(`/game/${game._id}`);
    } catch (err) {
      console.error("❌ Rating edit error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect(`/game/${req.params.id}`);
    }
  }
);

// Delete rating (admins only)
router.get("/game/:id/ratings/:index/delete", isAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      req.flash("error", "Spēle nav atrasta");
      return res.redirect("/");
    }
    const idx = parseInt(req.params.index);
    if (game.ratings[idx]) {
      game.ratings.splice(idx, 1);
      await game.save();
      req.flash("success", "Vērtējums dzēsts");
    } else {
      req.flash("error", "Vērtējums nav atrasts");
    }
    res.redirect(`/game/${game._id}`);
  } catch (err) {
    console.error("❌ Rating delete error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect(`/game/${req.params.id}`);
  }
});

export default router;
