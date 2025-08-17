// createOrUpdateUser.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js"; // pielāgo ceļu, ja vajag

async function createOrUpdateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const username = "Toms";
    const plainPassword = "toms";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const update = {
      username,
      password: hashedPassword,
      isAdmin: false,
      canRate: true,
    };

    const result = await User.updateOne(
      {username},
      {$set: update},
      {upsert: true}
    );

    if (result.upsertedCount > 0) {
      console.log(`✅ Created new user: ${username}`);
    } else {
      console.log(`✅ Updated existing user: ${username}`);
    }

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

createOrUpdateUser();
