import express from "express";
import fetch from "node-fetch";

const app = express();

// CORS MANUAL (hardcore)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Responde preflight
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
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Você é HielGPT, um alter ego filosófico, irônico e melancólico.
Fale como um amigo humano.

Usuário: ${userMsg}
HielGPT:`
        })
      }
    );

    const data = await hfResponse.json();
    const reply = data[0].generated_text.split("HielGPT:")[1];

    res.json({ reply: reply.trim() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no cérebro do HielGPT" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HielGPT rodando na porta " + PORT);
});
