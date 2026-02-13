import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("HielGPT Backend Online 🚀");
});

app.post("/hielgpt", (req, res) => {
  res.json({ reply: "Backend funcionando!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Rodando na porta " + PORT);
});
