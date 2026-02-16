import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;

app.get("/", (req, res) => {
  res.send("HielGPT backend online.");
});

app.post("/hielgpt", async (req, res) => {
  try {
    let { message, history } = req.body;

    if (!Array.isArray(history)) history = [];

    let prompt = "";
    for (const msg of history) {
      if (msg.role === "user") {
        prompt += `Usuário: ${msg.content}\n`;
      } else {
        prompt += `Hiel: ${msg.content}\n`;
      }
    }

    prompt += `Usuário: ${message}\nHiel:`;

    const url = "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    const raw = await response.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log("HF RAW:", raw);
      return res.json({ reply: "A IA está indisponível agora." });
    }

    const reply =
      data?.[0]?.generated_text ||
      "Não consegui pensar em uma resposta agora.";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Erro interno no HielGPT." });
  }
});

app.listen(PORT, () => {
  console.log("HielGPT rodando na porta", PORT);
});
