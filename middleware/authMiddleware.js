export const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/auth/login");
};

export const isAdmin = (req, res, next) => {
  if (req.session.user?.isAdmin) return next();
  res.status(403).render("errors/403");
};

// Automātiski pievieno user visām EJS lapām
export const attachUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user?.isAdmin || false;
  next();
};

