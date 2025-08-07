import {games} from "../data/games.js";
import express from "express";
const router = express.Router();

// Sākumlapa ar meklēšanu, filtrēšanu un kārtošanu
router.get("/", (req, res) => {
  const {category, search, sort} = req.query;

  let filteredGames = [...games];

  if (category && category.trim() !== "") {
    filteredGames = filteredGames.filter((game) =>
      game.category.includes(category)
    );
  }

  if (search && search.trim() !== "") {
    filteredGames = filteredGames.filter((game) =>
      game.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Aprēķina vidējo vērtējumu katrai spēlei (lai kārtotu pēc tā)
  filteredGames.forEach((game) => {
    if (game.ratings && game.ratings.length > 0) {
      game.avgRating =
        game.ratings.reduce((sum, r) => sum + r.score, 0) / game.ratings.length;
    } else {
      game.avgRating = 0;
    }
  });

  // Kārtošana pēc izvēles
  switch (sort) {
    case "rating":
      filteredGames.sort((a, b) => b.avgRating - a.avgRating);
      break;
    case "age":
      filteredGames.sort((a, b) => a.age - b.age);
      break;
    case "players":
      filteredGames.sort((a, b) => a.players - b.players);
      break;
    case "alphabet":
    default:
      filteredGames.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  const categories = [...new Set(games.flatMap((game) => game.category))];

  res.render("index", {
    games: filteredGames,
    category,
    search,
    categories,
    sort,
  });
});

// Atsevišķa spēles lapa
router.get("/game/:id", (req, res) => {
  const game = games.find((g) => g.id == req.params.id);
  if (!game) return res.status(404).render("404");
  res.render("game", {game});
});

// Par mums lapa
router.get("/about", (req, res) => {
  res.render("about");
});

export default router;
