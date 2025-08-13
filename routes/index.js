import express from "express";
import Game from "../models/game.js";
import mongoose from "mongoose";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware, kas padod lietotāja datus visiem skatiem
router.use((req, res, next) => {
  res.locals.currentPage =
    req.path === "/" ? "home" : req.path.replace("/", "");
  res.locals.user = req.session.user || null;
  next();
});

// Sākumlapa ar meklēšanu, filtrēšanu un kārtošanu
router.get("/", async (req, res) => {
  const {category, search, sort} = req.query;

  try {
    // Veido MongoDB query objektu
    let query = {};
    if (category && category.trim() !== "") {
      query.category = category;
    }
    if (search && search.trim() !== "") {
      query.title = {$regex: search, $options: "i"}; // case-insensitive meklēšana
    }

    // Iegūst spēles un kategorijas
    let [games, categories] = await Promise.all([
      Game.find(query).lean(),
      Game.distinct("category"),
    ]);

    // Aprēķina vidējo vērtējumu
    games = games.map((game) => {
      const avgRating =
        game.ratings?.length > 0
          ? game.ratings.reduce((sum, r) => sum + r.score, 0) /
            game.ratings.length
          : 0;
      return {...game, avgRating};
    });

    // Kārtošana
    const sortOptions = {
      rating: (a, b) => b.avgRating - a.avgRating,
      age: (a, b) => (a.minAge || 0) - (b.minAge || 0),
      players: (a, b) => (a.minPlayers || 0) - (b.minPlayers || 0),
      alphabet: (a, b) => a.title.localeCompare(b.title),
    };

    games.sort(sortOptions[sort] || sortOptions.alphabet);

    res.render("index", {
      games,
      category,
      search,
      categories,
      sort,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("500", {error: err.message});
  }
});

// Atsevišķa spēles lapa
router.get("/game/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .render("404", {message: "Nepareizs spēles ID formāts"});
    }

    const game = await Game.findById(req.params.id).lean();
    if (!game) {
      return res.status(404).render("404", {message: "Spēle nav atrasta"});
    }

    // Aprēķini vidējo vērtējumu
    game.avgRating =
      game.ratings?.length > 0
        ? game.ratings.reduce((sum, r) => sum + r.score, 0) /
          game.ratings.length
        : 0;

    // Pārbaudi, vai lietotājs ir admins (piemērs ar sesiju)
    const isAdmin = req.session.user && req.session.user.role === "admin";

    res.render("game", {
      game,
      currentPage: "game",
      isAdmin: req.session.user?.isAdmin || false,
    });
  } catch (err) {
    console.error("Kļūda ielādējot spēli:", err);
    res.status(500).render("500", {error: err.message});
  }
});

// Saglabā izmaiņas spēlē
router.post("/game/:id/edit", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render("404", { message: "Nepareizs spēles ID" });
    }

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).render("404", { message: "Spēle nav atrasta" });
    }

    // Atjauno laukus
    game.title = req.body.title;
    game.subtitle = req.body.subtitle;
    game.description = req.body.description;
    game.minPlayers = req.body.minPlayers || null;
    game.maxPlayers = req.body.maxPlayers || null;
    game.minDuration = req.body.minDuration || null;
    game.maxDuration = req.body.maxDuration || null;
    game.minAge = req.body.minAge || null;
    game.maxAge = req.body.maxAge || null;
    game.category = req.body.category?.split(/\s*,\s*/) || [];
    game.location = req.body.location;
    game.components = req.body.components?.split(/\s*,\s*/) || [];
    game.review = req.body.review;

    await game.save();

    res.redirect(`/game/${id}`);
  } catch (err) {
    console.error("Kļūda saglabājot spēli:", err);
    res.status(500).render("500", { error: err.message });
  }
});

// Par mums lapa
router.get("/about", (req, res) => {
  res.render("about", {
    currentPage: "about",
  });
});

// 404 Kļūdu apstrāde
router.use((req, res) => {
  res.status(404).render("404", {
    message: "Lapa nav atrasta",
    currentPage: null,
  });
});

// Servera kļūdu apstrāde
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", {
    error: err.message,
    currentPage: null,
  });
});

export default router;
