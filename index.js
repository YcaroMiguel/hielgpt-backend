import express from "express";
import cors from "cors";

// Node 18+ já possui fetch nativo. Se estiver em versão anterior, 
// descomente a linha abaixo e instale: npm install node-fetch
// import fetch from "node-fetch"; 

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_TOKEN = process.env.HF_TOKEN;

// Rota de teste para verificar se o Render subiu o serviço
app.get("/", (req, res) => {
  res.send("HielGPT Backend está operando no novo Router da HF.");
});

app.post("/hielgpt", async (req, res) => {
  try {
    let { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Mensagem inválida." });
    }

    // Formata o histórico para o padrão Chat Completion (v1)
    // O Router espera: { role: "user" | "assistant" | "system", content: "..." }
    const messages = [
      { role: "system", content: "Você é o HielGPT, um assistente prestativo e inteligente." }
    ];

    if (Array.isArray(history)) {
      history.forEach(msg => {
        messages.push({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.content
        });
      });
    }

    // Adiciona a mensagem atual do usuário
    messages.push({ role: "user", content: message });

    const url = "https://router.huggingface.co/hf-inference/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: messages,
        max_tokens: 250,
        temperature: 0.7,
        stream: false
      })
    });

    const data = await response.json();

    // Tratamento de erro da API (ex: Token inválido ou Cota excedida)
    if (!response.ok) {
      console.error("Erro na API da Hugging Face:", data);
      return res.status(response.status).json({ 
        reply: "Tive um problema ao processar isso. Tente novamente em alguns instantes." 
      });
    }

    // No padrão v1, a resposta vem em choices[0].message.content
    const reply = data.choices?.[0]?.message?.content || "Não consegui gerar uma resposta.";

    res.json({ reply });

  } catch (err) {
    console.error("Erro no Servidor:", err);
    res.status(500).json({ reply: "Erro interno no servidor do HielGPT." });
  }
});

app.listen(PORT, () => {
  console.log(`HielGPT rodando na porta ${PORT}`);
});
