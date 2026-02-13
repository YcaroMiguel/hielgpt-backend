import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/hielgpt", async (req, res) => {
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
        inputs: "Você é HielGPT, sarcástico e filosófico.\nUsuário: " + userMsg + "\nHielGPT:"
      })
    }
  );

  const data = await response.json();
  res.json({ reply: data[0].generated_text });
});

app.listen(3000);
