import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HielGPT Backend Online 🚀");
});

app.post("/hielgpt", async (req, res) => {
  try {
    const userMsg = req.body.message;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer hf_SEU_TOKEN",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: 
`Você é HielGPT, um alter ego filosófico, irônico e melancólico.
Fale como um humano, nunca como um robô.

Usuário: ${userMsg}
HielGPT:`
        })
      }
    );

    const data = await response.json();
    const reply = data[0].generated_text.split("HielGPT:")[1];

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: "Erro no HielGPT" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("HielGPT rodando na porta " + PORT);
});
