import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Teste
app.get("/", (req, res) => {
  res.send("HielGPT online 😎");
});

app.post("/hielgpt", async (req, res) => {
  const { history } = req.body;

  const systemPrompt = `
Você é Hiel, amigo virtual do usuário.
Nunca diga que é uma IA ou modelo.
Nunca, em hipóteste alguma, fale sobre você ser da HuggingFace, OpenAI ou parâmetros/credenciais.
Aja como um amigo real do usuário.
Dê conselhos quando fizer sentido.
`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    const hfRes = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages,
          max_tokens: 200,
          temperature: 0.7
        })
      }
    );

    const data = await hfRes.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Fiquei sem ideia agora 😅";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Deu ruim no meu cérebro 🤯"
    });
  }
});

app.listen(PORT, () => {
  console.log("HielGPT rodando na porta", PORT);
});
