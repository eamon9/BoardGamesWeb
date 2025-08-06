import express from "express";
const router = express.Router();

const games = [
  {
    id: 1,
    title: "Risk",
    description: "Stratēģijas spēle par resursiem",
    image: "/images/risk.jpg",
  },
  {
    id: 2,
    title: "Taco, Hat, Cake, Gift, Pizza",
    description: "Kāršu spēle...",
    image: "/images/taco_hat.jpg",
  },
];

// Sākumlapa
router.get("/", (req, res) => {
  res.render("index", {games});
});

// Atsevišķa spēle
router.get("/game/:id", (req, res) => {
  const game = games.find((g) => g.id == req.params.id);
  if (!game) return res.status(404).send("Spēle nav atrasta");
  res.render("game", {game});
});

// Par mums
router.get("/about", (req, res) => {
  res.render("about");
});

export default router;
