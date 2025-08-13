import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Ielogošanās forma
router.get("/login", (req, res) => {
  res.render("login", {
    currentPage: "login",
    error: req.flash("error")[0] || null, // Pārveidojiet flash ziņas
    success: req.flash("success")[0] || null,
    user: req.user || null, // Pievienojiet user mainīgo
  });
});

// Ielogošanās POST maršruts
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});

    if (!user) {
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect("/auth/login");
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect("/auth/login");
    }

    req.session.user = user;
    req.flash("success", "Veiksmīgi ielogojāties!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Servera kļūda");
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Neizdevās izlogoties");
    }
    res.redirect("/"); // Pēc izlogoties atgriež uz mājaslapu
  });
});

export default router;
