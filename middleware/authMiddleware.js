export const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash("error", "Jums jābūt pieslēgtam");
  res.redirect("/auth/login");
};

export const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) return next();
  req.flash("error", "Jums jābūt administratoram");
  res.redirect("/");
};

// Automātiski pievieno user visām EJS lapām
export const attachUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user?.isAdmin || false;
  next();
};
