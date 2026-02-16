import express from "express";
import cors from "cors";
// Se estiver no Node 18+, delete a linha do node-fetch. Se for inferior, mantenha-a.
import fetch from "node-fetch"; 

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

    if (typeof message !== "string") {
      return res.status(400).json({ reply: "Mensagem inválida." });
    }

    if (!Array.isArray(history)) {
      history = [];
    }

    // Melhora no Prompt para modelos Mistral Instruct
    let prompt = "<s>";
    for (const msg of history) {
      if (msg.role === "user") {
        prompt += `[INST] ${msg.content} [/INST]`;
      } else if (msg.role === "bot") {
        prompt += ` ${msg.content} </s>`;
      }
    }
    prompt += `[INST] ${message} [/INST]`;

    const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    const data = await response.json();

    // Verifica se a API retornou erro (ex: modelo carregando)
    if (!response.ok) {
      console.error("Erro HF:", data);
      return res.status(response.status).json({ 
        reply: data.error || "A IA está descansando agora. Tente em breve." 
      });
    }

    // O retorno do HF costuma ser um array: [{ generated_text: "..." }]
    const reply = data[0]?.generated_text?.trim() || "Não consegui pensar em uma resposta.";

    res.json({ reply });

  } catch (err) {
    console.error("ERRO CRÍTICO:", err);
    res.status(500).json({ reply: "Erro interno no cérebro do HielGPT." });
  }
});

app.listen(PORT, () => {
  console.log(`HielGPT rodando na porta ${PORT}`);
});
