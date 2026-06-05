import express from "express";
import cors from "cors";
import { fetch } from "undici";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.OPENROUTER_API_KEY;
const URL = "https://openrouter.ai/api/v1/chat/completions";

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!API_KEY) {
      return res.json({ reply: "Server error: missing API key" });
    }

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
body: JSON.stringify({
  model: "mistralai/mistral-7b-instruct",
  messages: [
    { role: "user", content: message }
  ]
})
    });

    const data = await response.json();

    // IMPORTANT: show real error if API fails
    if (!response.ok) {
      return res.json({
        reply: `API Error: ${data?.error?.message || JSON.stringify(data)}`
      });
    }

  const reply =
  data?.choices?.[0]?.message?.content ||
  "AI returned empty response.";

    if (!reply) {
      return res.json({
        reply: `No valid response: ${JSON.stringify(data)}`
      });
    }

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Server Exception: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
