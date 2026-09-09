import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  // Redzamais vārds vērtējumos un UI (piem. "Imants"), atšķiras no
  // username, kas var būt tehnisks/vienkāršāks. Ja nav iestatīts, tiek
  // izmantots username kā fallback. Vecuma daļa (piem. "35+ gadi") vairs
  // nav jāraksta šeit manuāli - tā tiek aprēķināta no `birthDate`, skat.
  // getAgeLabel().
  displayName: {
    type: String,
  },
  // Lietotājs pats var iestatīt savā profilā, lai vecums vērtējumos
  // rādās vienmēr aktuāls, nevis manuāli iestatīts fiksēts teksts.
  birthDate: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  canRate: {
    type: Boolean,
    default: true
  },
  // Admin izveidoja kontu vai atiestatīja paroli - lietotājam parāda
  // maigu (ne piespiedu) atgādinājumu nomainīt paroli profilā.
  passwordTemporary: {
    type: Boolean,
    default: false,
  },
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vecums no dzimšanas datuma, formatēts attēlošanai (piem. "36 gadi").
// Atgriež null, ja birthDate nav iestatīts. Standalone funkcija (ne tikai
// schema metode), jo tā jāizmanto arī uz .lean() objektiem (piem.
// populate('ratings.userId') rezultātā), kuriem Mongoose metodes nav
// pieejamas.
export function getAgeLabel(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return `${age} gadi`;
}

userSchema.methods.getAgeLabel = function () {
  return getAgeLabel(this.birthDate);
};

const User = mongoose.model("User", userSchema);

export default User;
