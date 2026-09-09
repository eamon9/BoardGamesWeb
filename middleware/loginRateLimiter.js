// Vienkāršs in-memory rate limiter login mēģinājumiem.
// Piezīme: šis strādā uz vienas Render instances; ja projekts aug līdz
// vairākiem serveriem, limitu vajadzēs pārnest uz MongoDB/Redis.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minūtes
const attempts = new Map(); // key: ip+username -> {count, firstAttempt}

function cleanupOld() {
  const now = Date.now();
  for (const [key, data] of attempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS) attempts.delete(key);
  }
}

export const loginRateLimiter = (req, res, next) => {
  cleanupOld();

  const username = (req.body.username || "").toLowerCase().trim();
  const key = `${req.ip}:${username}`;
  const now = Date.now();
  const record = attempts.get(key);

  if (record && now - record.firstAttempt < WINDOW_MS) {
    if (record.count >= MAX_ATTEMPTS) {
      req.flash(
        "error",
        "Pārāk daudz nesekmīgu pieslēgšanās mēģinājumu. Pagaidi dažas minūtes un mēģini vēlreiz."
      );
      return res.redirect("/auth/login");
    }
  }

  // Skaitīšanu palielina paši login route (pēc neveiksmes), šeit tikai bloķējam.
  req._rateLimitKey = key;
  next();
};

export const recordFailedAttempt = (key) => {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(key, {count: 1, firstAttempt: now});
  } else {
    record.count += 1;
  }
};

export const clearAttempts = (key) => {
  attempts.delete(key);
};
