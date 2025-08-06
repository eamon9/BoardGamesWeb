import { log } from "console";
import express from "express";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})