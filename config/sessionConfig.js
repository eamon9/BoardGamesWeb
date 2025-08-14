import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

export const createSessionMiddleware = () => {
  const isProd = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      secure: isProd,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
      httpOnly: true,
    },
  });
};
