import express from "express";
import {body, validationResult} from "express-validator";
import {isAuthenticated} from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash("error", "Lietotājs nav atrasts");
      return res.redirect("/");
    }
    res.render("profile", {
      currentPage: "profile",
      profileUser: user,
    });
  } catch (err) {
    console.error("❌ Profile load error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/");
  }
});

// Update own birth date, used to compute age shown next to ratings.
router.post(
  "/birthdate",
  isAuthenticated,
  [body("birthDate").isISO8601().withMessage("Nepareizs datuma formāts")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/profile");
    }
    try {
      await User.findByIdAndUpdate(req.session.user.id, {
        birthDate: req.body.birthDate,
      });
      req.flash("success", "Dzimšanas datums saglabāts");
      res.redirect("/profile");
    } catch (err) {
      console.error("❌ Birthdate update error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect("/profile");
    }
  }
);

// Self-service password change. Not mandatory even after an admin sets
// a temporary password, but this is how a user does it if they want to.
router.post(
  "/change-password",
  isAuthenticated,
  [
    body("newPassword")
      .isLength({min: 6})
      .withMessage("Jaunajai parolei jābūt vismaz 6 rakstzīmes garai"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/profile");
    }

    try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
        req.flash("error", "Lietotājs nav atrasts");
        return res.redirect("/profile");
      }

      const {currentPassword, newPassword} = req.body;
      if (!(await user.comparePassword(currentPassword))) {
        req.flash("error", "Pašreizējā parole nav pareiza");
        return res.redirect("/profile");
      }
      if (newPassword.toLowerCase() === user.username.toLowerCase()) {
        req.flash("error", "Parole nevar būt vienāda ar lietotājvārdu");
        return res.redirect("/profile");
      }

      user.password = newPassword;
      user.passwordTemporary = false;
      await user.save();

      req.flash("success", "Parole nomainīta");
      res.redirect("/profile");
    } catch (err) {
      console.error("❌ Password change error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect("/profile");
    }
  }
);

export default router;
