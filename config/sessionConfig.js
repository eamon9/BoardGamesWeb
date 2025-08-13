import session from "express-session";
import MongoStore from "connect-mongo";

export function createSessionMiddleware(mongoUri, secret) {
  if (!mongoUri) throw new Error("MONGO_URI is required for sessions");
  if (!secret) throw new Error("SESSION_SECRET is required for sessions");

  return session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 diena
    },
  });
}
