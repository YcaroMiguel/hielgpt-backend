import express from "express";
import fetch from "node-fetch";

const app = express();

/* ===== CORS MANUAL ===== */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("HielGPT Backend Online 🚀");
});

app.post("/hielgpt", async (req, res) => {
  try {
    const userMsg = req.body.message;

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMsg
        })
      }
    );

    const data = await hfResponse.json();
    console.log("HF RESPONSE:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const reply = data[0].generated_text;
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no cérebro do HielGPT" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HielGPT rodando na porta " + PORT);
});
