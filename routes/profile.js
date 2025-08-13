import express from "express";
import {isAuthenticated} from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", isAuthenticated, (req, res) => {
  res.render("profile", {
    currentPage: "profile",
    user: req.session.user,
  });
});

export default router;
