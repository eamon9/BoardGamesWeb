import express from "express";
import User from "../models/User.js"; // jūsu User modelis
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login"); // pieņem, ka EJS login forms
});

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  console.log("🔹 Login attempt:", username);

  try {
    const user = await User.findOne({username});
    console.log("🔹 User found in DB:", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("❌ Login failed: wrong credentials");
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect("/auth/login");
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    console.log("🔹 Session user set:", req.session.user);

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        req.flash("error", "Pieslēgšanās kļūda");
        return res.redirect("/auth/login");
      }
      console.log("✅ Session saved, redirecting...");
      return res.redirect("/");
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
