import express from "express";
import cors from "cors";

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
      return res.json({
        reply: "Server error: OPENROUTER_API_KEY is missing in environment variables."
      });
    }

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentoriq-ai.onrender.com",
        "X-Title": "MentorIQ AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // 🔥 IMPORTANT: show real API errors clearly
    if (!response.ok) {
      return res.json({
        reply: "OPENROUTER ERROR: " + (data?.error?.message || JSON.stringify(data))
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({
        reply: "EMPTY RESPONSE FROM AI: " + JSON.stringify(data, null, 2)
      });
    }

    res.json({ reply });

  } catch (err) {
    res.json({
      reply: "SERVER EXCEPTION: " + err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
