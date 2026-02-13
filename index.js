import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN; // coloque no Render (env var)

app.get("/", (req, res) => {
  res.send("HielGPT backend online.");
});

app.post("/hielgpt", async (req, res) => {
  try {
    let { message, history } = req.body;

    // Garantia absoluta
    if (!Array.isArray(history)) {
      history = [];
    }

    // Monta o contexto
    let prompt = "";
    for (const msg of history) {
      if (msg.role === "user") {
        prompt += `Usuário: ${msg.content}\n`;
      } else {
        prompt += `Hiel: ${msg.content}\n`;
      }
    }

    prompt += `Usuário: ${message}\nHiel:`;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
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
      }
    );

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.log("HF RAW:", rawText);
      return res.json({ reply: "Erro ao falar com a IA." });
    }

    const reply =
      data?.[0]?.generated_text ||
      "Não consegui pensar em uma resposta agora.";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Erro interno no cérebro do Hiel." });
  }
});

app.listen(PORT, () => {
  console.log("HielGPT rodando na porta", PORT);
});
