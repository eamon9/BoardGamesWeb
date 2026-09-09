import express from "express";
import {body, validationResult} from "express-validator";
import Game from "../models/game.js";
import {isAuthenticated, isAdmin} from "../middleware/authMiddleware.js";

const router = express.Router();

// Add new rating. Tied to the logged-in account, one rating per user per
// game (enforced here, not just hidden in the UI). name/userId always
// come from the session, never from the request body, so a user can't
// submit a rating under someone else's name.
router.post(
  "/game/:id/ratings/new",
  isAuthenticated,
  [
    body("score")
      .isFloat({min: 0, max: 10})
      .withMessage("Vērtējumam jābūt no 0 līdz 10"),
    body("comment").trim().optional(),
  ],
  async (req, res) => {
    if (req.session.user.canRate === false) {
      req.flash("error", "Jums nav tiesību vērtēt spēles");
      return res.redirect(`/game/${req.params.id}`);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(`/game/${req.params.id}`);
    }

    try {
      const {score, comment} = req.body;
      const game = await Game.findById(req.params.id);
      if (!game) {
        req.flash("error", "Spēle nav atrasta");
        return res.redirect("/");
      }

      const userId = req.session.user.id;
      const alreadyRated = game.ratings.some(
        (r) => r.userId && String(r.userId) === String(userId)
      );
      if (alreadyRated) {
        req.flash("error", "Jūs jau esat novērtējis šo spēli, rediģējiet esošo vērtējumu");
        return res.redirect(`/game/${game._id}`);
      }

      game.ratings.push({
        name: req.session.user.displayName || req.session.user.username,
        userId,
        score: parseFloat(score),
        comment,
      });
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

// Edit existing rating: admins can edit any rating, a regular user can
// only edit their own (ownership checked against rating.userId, not
// trusted from the request). The displayed name never changes here,
// only score/comment, so nobody can rename a rating to impersonate
// someone else.
router.post(
  "/game/:id/ratings/:index/edit",
  isAuthenticated,
  [
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
      const {score, comment} = req.body;
      const game = await Game.findById(req.params.id);
      if (!game) {
        req.flash("error", "Spēle nav atrasta");
        return res.redirect("/");
      }
      const idx = parseInt(req.params.index);
      const rating = game.ratings[idx];
      if (!rating) {
        req.flash("error", "Vērtējums nav atrasts");
        return res.redirect(`/game/${game._id}`);
      }

      const isOwner =
        rating.userId && String(rating.userId) === String(req.session.user.id);
      if (!req.session.user.isAdmin && !isOwner) {
        req.flash("error", "Jums nav tiesību rediģēt šo vērtējumu");
        return res.redirect(`/game/${game._id}`);
      }

      rating.score = parseFloat(score);
      rating.comment = comment;
      await game.save();
      req.flash("success", "Vērtējums atjaunināts");
      res.redirect(`/game/${game._id}`);
    } catch (err) {
      console.error("❌ Rating edit error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect(`/game/${req.params.id}`);
    }
  }
);

// Delete rating (admins only)
router.post("/game/:id/ratings/:index/delete", isAdmin, async (req, res) => {
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
