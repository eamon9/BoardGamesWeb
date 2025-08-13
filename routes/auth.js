import express from "express";
import User from "../models/User.js"; // jūsu User modelis
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login"); // pieņem, ka EJS login forms
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});

  if (!user) {
    req.flash("error", "Nepareizs lietotājvārds vai parole");
    return res.redirect("/auth/login");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    req.flash("error", "Nepareizs lietotājvārds vai parole");
    return res.redirect("/auth/login");
  }

  // Admin check (ja vajadzīgs)
  if (!user.isAdmin) {
    req.flash("error", "Nav administrācijas piekļuves");
    return res.redirect("/auth/login");
  }

  req.session.user = {
    id: user._id,
    username: user.username,
    isAdmin: user.isAdmin,
  };

  req.flash("success", "Veiksmīgi pieslēdzies");
  res.redirect("/admin");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
