import express from "express";
import fetch from "node-fetch";

const app = express();

/* ===== CORS MANUAL (nunca falha) ===== */
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

/* ===== Rota teste ===== */
app.get("/", (req, res) => {
  res.send("HielGPT Backend Online 🚀");
});

/* ===== Rota da IA ===== */
app.post("/hielgpt", async (req, res) => {
  try {
    const userMsg = req.body.message;

    if (!userMsg) {
      return res.status(400).json({ error: "Mensagem vazia" });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
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

    // Tratamento de erro da HF
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    // Resposta normal
    if (!Array.isArray(data)) {
      return res.status(500).json({ error: "Resposta inesperada da IA" });
    }

    const reply = data[0].generated_text;

    res.json({ reply });

  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: "Erro interno no HielGPT" });
  }
});

/* ===== Porta ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HielGPT rodando na porta " + PORT);
});
