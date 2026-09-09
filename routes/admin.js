import express from "express";
import {body, validationResult} from "express-validator";
import {isAdmin} from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Game from "../models/game.js";

const router = express.Router();
router.use(isAdmin); // All routes require admin access

const createUserValidation = [
  body("username").trim().notEmpty().withMessage("Lietotājvārds ir obligāts"),
  body("password")
    .isLength({min: 6})
    .withMessage("Parolei jābūt vismaz 6 rakstzīmes garai"),
];

const resetPasswordValidation = [
  body("password")
    .isLength({min: 6})
    .withMessage("Parolei jābūt vismaz 6 rakstzīmes garai"),
];

const editUserValidation = [
  body("username").trim().notEmpty().withMessage("Lietotājvārds ir obligāts"),
];

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

// Create new user with a temporary password admin chooses. Password
// hashing happens via the User model's pre-save hook (user.save()),
// not manually here.
router.post("/users/new", createUserValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/admin/users");
  }

  try {
    const {username, password, displayName, isAdmin: makeAdmin} = req.body;

    if (password.toLowerCase() === username.toLowerCase()) {
      req.flash("error", "Parole nevar būt vienāda ar lietotājvārdu");
      return res.redirect("/admin/users");
    }

    const existing = await User.findOne({username});
    if (existing) {
      req.flash("error", "Lietotājvārds jau aizņemts");
      return res.redirect("/admin/users");
    }

    const user = new User({
      username,
      password,
      displayName: displayName?.trim() || undefined,
      isAdmin: makeAdmin === "on",
      passwordTemporary: true,
    });
    await user.save();

    req.flash("success", `Lietotājs ${username} izveidots ar pagaidu paroli`);
    res.redirect("/admin/users");
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "Lietotājvārds jau aizņemts");
    } else {
      console.error("❌ Create user error:", err);
      req.flash("error", "Servera kļūda");
    }
    res.redirect("/admin/users");
  }
});

// Reset a user's password to one the admin chooses. Not mandatory for
// the user to change afterwards, just flagged so the profile page can
// show a gentle reminder.
router.post(
  "/users/:id/reset-password",
  resetPasswordValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/admin/users");
    }

    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.flash("error", "Lietotājs nav atrasts");
        return res.redirect("/admin/users");
      }

      if (req.body.password.toLowerCase() === user.username.toLowerCase()) {
        req.flash("error", "Parole nevar būt vienāda ar lietotājvārdu");
        return res.redirect("/admin/users");
      }

      user.password = req.body.password;
      user.passwordTemporary = true;
      await user.save();

      req.flash("success", `Parole lietotājam ${user.username} atiestatīta`);
      res.redirect("/admin/users");
    } catch (err) {
      console.error("❌ Reset password error:", err);
      req.flash("error", "Servera kļūda");
      res.redirect("/admin/users");
    }
  }
);

// Edit a user's username/displayName. Username uniqueness is checked
// explicitly (nicer error message) and also enforced by the schema
// (unique: true) as a fallback against races.
router.post("/users/:id/edit", editUserValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect("/admin/users");
  }

  try {
    const {username, displayName} = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "Lietotājs nav atrasts");
      return res.redirect("/admin/users");
    }

    if (username !== user.username) {
      const existing = await User.findOne({username});
      if (existing) {
        req.flash("error", "Lietotājvārds jau aizņemts");
        return res.redirect("/admin/users");
      }
    }

    user.username = username;
    user.displayName = displayName?.trim() || undefined;
    await user.save();

    // Ja admin rediģē savu paša kontu, atjauno arī sesiju, lai
    // lietotājvārds nepaliek novecojis līdz nākamajai pieslēgšanās reizei.
    if (String(req.session.user.id) === String(user._id)) {
      req.session.user.username = user.username;
      req.session.user.displayName = user.displayName || user.username;
    }

    req.flash("success", `Lietotājs ${username} atjaunināts`);
    res.redirect("/admin/users");
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "Lietotājvārds jau aizņemts");
    } else {
      console.error("❌ Edit user error:", err);
      req.flash("error", "Servera kļūda");
    }
    res.redirect("/admin/users");
  }
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
