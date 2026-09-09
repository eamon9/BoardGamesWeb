import express from "express";
import User from "../models/User.js"; // User model for MongoDB
import bcrypt from "bcrypt"; // Password hashing
import {
  loginRateLimiter,
  recordFailedAttempt,
  clearAttempts,
} from "../middleware/loginRateLimiter.js";

const router = express.Router();

// Only allow redirecting back to a relative path on this same site, never
// to another host - otherwise ?returnTo= could be used for open-redirect
// phishing (e.g. returnTo=https://evil.example.com or returnTo=//evil.example.com).
function isSafeReturnPath(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("://")
  );
}

router.get("/login", (req, res) => {
  // ?returnTo= (set by the login links themselves, see res.locals.currentUrl
  // in app.js) is preferred over the Referer header, which our own
  // Referrer-Policy: no-referrer strips on every navigation anyway.
  const returnTo = req.query.returnTo;
  req.session.returnTo = isSafeReturnPath(returnTo)
    ? returnTo
    : req.get("referer") || "/";
  res.render("auth/login", {returnTo: req.session.returnTo});
});

router.post("/login", loginRateLimiter, async (req, res) => {
  const {username, password} = req.body;

  // The login form also carries returnTo as a hidden field (see
  // views/auth/login.ejs), so it survives even across several failed
  // attempts that redirect back to GET /login in between - relying on
  // req.session.returnTo alone would let a fresh GET (with no ?returnTo=)
  // reset it back to "/" on a retry.
  const returnTo = isSafeReturnPath(req.body.returnTo)
    ? req.body.returnTo
    : req.session.returnTo || "/";
  const loginPageUrl = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  // Check for existing session
  if (req.session.user) {
    return res.redirect(returnTo);
  }

  // Validate inputs
  if (!username || !password) {
    req.flash("error", "Lietotājvārds un parole ir obligāti");
    return res.redirect(loginPageUrl);
  }

  try {
    const user = await User.findOne({username});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      recordFailedAttempt(req._rateLimitKey);
      req.flash("error", "Nepareizs lietotājvārds vai parole");
      return res.redirect(loginPageUrl);
    }

    clearAttempts(req._rateLimitKey);

    req.session.user = {
      id: user._id,
      username: user.username,
      displayName: user.displayName || user.username,
      isAdmin: user.isAdmin,
      canRate: user.canRate,
    };

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        req.flash("error", "Pieslēgšanās kļūda");
        return res.redirect(loginPageUrl);
      }
      return res.redirect(returnTo);
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    req.flash("error", "Servera kļūda");
    res.redirect(loginPageUrl);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid"); // Clear session cookie
    return res.redirect("login");
  });
});

export default router; // Exports router for use in app.js
