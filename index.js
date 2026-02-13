import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// CORS CONFIGURADO CORRETAMENTE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Permite preflight manualmente (ESSENCIAL)
app.options("*", cors());

app.use(express.json());

// Rota teste
app.get("/", (req, res) => {
  res.send("HielGPT Backend Online 🚀");
});

// Rota da IA
app.post("/hielgpt", async (req, res) => {
  try {
    const userMsg = req.body.message;

    if (!userMsg) {
      return res.status(400).json({ error: "Mensagem vazia" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer hf_SEU_TOKEN_AQUI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: 
`Você é HielGPT, um alter ego filosófico, irônico e melancólico.
Você fala como um amigo humano.

Usuário: ${userMsg}
HielGPT:` 
        })
      }
    );

    const data = await response.json();

    if (!data || !data[0]?.generated_text) {
      return res.status(500).json({ error: "Resposta inválida da IA" });
    }

    const reply = data[0].generated_text.split("HielGPT:")[1];

    res.json({ reply: reply.trim() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no HielGPT" });
  }
});

// Porta do Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HielGPT rodando na porta " + PORT);
});
