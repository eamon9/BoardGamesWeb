// Lietošana: node scripts/migrateRatingsToUsers.js [--dry-run]
//
// Sasaista vecos vērtējumus (kuriem ir tikai `name` string, bez `userId`)
// ar reāliem User kontiem, salīdzinot rating.name pret lietotāja
// displayName vai username. Palaid TIKAI pēc tam, kad esi izveidojis
// kontus visiem ģimenes locekļiem (skat. config/users.js sarakstu, kur
// displayName jāsakrīt ar to, kā vārds parādās esošajos vērtējumos).
//
// --dry-run parāda, kas tiktu izmainīts, bet neko nesaglabā DB.

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Game from "../models/game.js";
import User from "../models/User.js";

// Noņem veco vecuma piedēkli, piem. "Imants (35+ gadi)" -> "imants".
// Vajadzīgs, jo jaunajos kontos vecums vairs netiek rakstīts displayName -
// tas tagad rēķinās no birthDate (skat. models/User.js getAgeLabel).
function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s*\(\s*\d+\+?\s*gadi\s*\)\s*$/i, "");
}

async function migrate() {
  const dryRun = process.argv.includes("--dry-run");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected${dryRun ? " (dry run, nekas netiks saglabāts)" : ""}`);

    const users = await User.find({});
    if (users.length === 0) {
      console.error("❌ Nav neviena User konta DB. Vispirms izveido kontus ar createUser.js.");
      process.exit(1);
    }

    // Karte pēc normalizēta displayName/username -> User
    const byNormalizedName = new Map();
    for (const u of users) {
      if (u.displayName) byNormalizedName.set(normalize(u.displayName), u);
      byNormalizedName.set(normalize(u.username), u);
    }

    const games = await Game.find({});
    let matchedCount = 0;
    let alreadyLinkedCount = 0;
    const unmatchedNames = new Set();
    let gamesChanged = 0;

    for (const game of games) {
      let changed = false;
      for (const rating of game.ratings) {
        if (rating.userId) {
          alreadyLinkedCount++;
          continue;
        }
        const match = byNormalizedName.get(normalize(rating.name));
        if (match) {
          rating.userId = match._id;
          matchedCount++;
          changed = true;
        } else {
          unmatchedNames.add(rating.name);
        }
      }
      if (changed) {
        gamesChanged++;
        if (!dryRun) await game.save();
      }
    }

    console.log(`\n📊 Rezultāts:`);
    console.log(`   Jau bija saistīti: ${alreadyLinkedCount}`);
    console.log(`   Jauni sasaistīti: ${matchedCount} (${gamesChanged} spēlēs)`);
    if (unmatchedNames.size > 0) {
      console.log(`   Nesasaistīti vārdi (nav atrasts konts ar šādu displayName/username):`);
      for (const name of unmatchedNames) console.log(`     - "${name}"`);
      console.log(`   Izveido kontus šiem vārdiem un palaid skriptu vēlreiz.`);
    } else {
      console.log(`   Visi vārdi tika sasaistīti.`);
    }

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

migrate();
