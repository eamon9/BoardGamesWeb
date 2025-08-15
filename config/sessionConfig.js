import session from "express-session";
import MongoStore from "connect-mongo";

export const createSessionMiddleware = () => {
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }).on("error", (err) => console.error("MongoStore error:", err)),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax", // Consistent for both envs unless 'none' is required
      httpOnly: true,
    },
  });
};
