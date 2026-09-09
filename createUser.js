// createOrUpdateUser.js
// Lietošana: node createUser.js <username> <password> [--admin] [--name="Attēlotais vārds"]
// Parole vairs netiek glabāta kodā - tas ir svarīgi, jo šis repo ir publisks.

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";

async function createOrUpdateUser() {
  const [username, plainPassword, ...flags] = process.argv.slice(2);
  const isAdmin = flags.includes("--admin");
  const nameFlag = flags.find((f) => f.startsWith("--name="));
  const displayName = nameFlag ? nameFlag.slice("--name=".length) : undefined;

  if (!username || !plainPassword) {
    console.error(
      '❌ Lietošana: node createUser.js <username> <password> [--admin] [--name="Attēlotais vārds"]'
    );
    process.exit(1);
  }

  if (plainPassword.toLowerCase() === username.toLowerCase()) {
    console.error("❌ Parole nevar būt vienāda ar lietotājvārdu. Izvēlies drošāku paroli.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const update = {
      username,
      password: hashedPassword,
      isAdmin,
      canRate: true,
      ...(displayName ? {displayName} : {}),
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
    process.exit(1);
  }
}

createOrUpdateUser();
