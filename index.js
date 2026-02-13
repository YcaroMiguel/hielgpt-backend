import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

app.post("/hielgpt", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const messages = [
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: messages,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.generated_text?.slice(-1)[0]?.content ||
      "Deu ruim aqui no meu cérebro 😵";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no cérebro do HielGPT" });
  }
});

app.get("/", (req, res) => {
  res.send("HielGPT backend online.");
});

app.listen(10000, () => {
  console.log("HielGPT rodando na porta 10000");
});
