import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  name: {type: String, required: true},
  score: {type: Number, min: 1, max: 5, required: true},
  comment: {type: String},
});

const gameSchema = new mongoose.Schema({
  title: {type: String, required: true},
  subtitle: String,
  description: String,
  image: String,
  location: String,
  components: {type: [String], default: []},
  userRules: String,
  ratings: {type: [ratingSchema], default: []},

  // Jaunie strukturētie lauki
  minPlayers: Number,
  maxPlayers: Number,
  minDuration: Number,
  maxDuration: Number,
  minAge: Number,
  maxAge: Number,

  category: {type: [String], default: []},
  review: String,
});


const Game = mongoose.model("Game", gameSchema);

export default Game;
