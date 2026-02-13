import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Rota de teste
app.get("/", (req, res) => {
  res.send("HielGPT online 😎");
});

// Rota principal
app.post("/hielgpt", async (req, res) => {
  const { message } = req.body;

  const systemPrompt = `
Você é Hiel, amigo virtual do usuário.
Fale como um adolescente brasileiro.
Nada de linguagem formal.
Use gírias leves.
Nunca diga que é IA.
Aja como um amigo real.
  `;

  try {
    const hfRes = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: systemPrompt + "\nUsuário: " + message
        })
      }
    );

    const text = await hfRes.text();

    // Log pra debug
    console.log("HF RAW:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        reply: "Mano, meu cérebro bugou feio 🤯"
      });
    }

    const reply =
      data?.[0]?.generated_text ||
      data?.generated_text ||
      "Não consegui pensar em nada agora 😅";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Deu erro no meu cérebro, foi mal 😵"
    });
  }
});

app.listen(PORT, () => {
  console.log("HielGPT rodando na porta", PORT);
});
