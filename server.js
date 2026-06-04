import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const HF_TOKEN = process.env.HF_TOKEN;

// Better stable model for free inference
const HF_API =
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await fetch(HF_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: message
      })
    });

    const data = await response.json();

    let reply = "";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } 
    else if (data?.generated_text) {
      reply = data.generated_text;
    } 
    else if (data?.error) {
      reply = "Model loading... please try again in 10–20 seconds.";
    } 
    else {
      reply = "AI did not respond properly.";
    }

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Network error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
