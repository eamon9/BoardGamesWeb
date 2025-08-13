import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

export const createSessionMiddleware = () => {
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS tikai prod vidē
      maxAge: 24 * 60 * 60 * 1000, // 1 diena
      sameSite: "lax",
    },
  });
};
