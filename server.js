import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.OPENROUTER_API_KEY;
const URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * SIMPLE MEMORY (per server session)
 * NOTE: resets when Render restarts (free tier limitation)
 */
const chatMemory = [];

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!API_KEY) {
      return res.json({
        reply: "Server error: OPENROUTER_API_KEY is missing."
      });
    }

    // keep last 10 messages only (memory control)
    chatMemory.push({ role: "user", content: message });
    if (chatMemory.length > 10) chatMemory.shift();

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
          {
  {
  role: "system",
  content: `
You are MentorIQ AI.

MentorIQ AI is a product created and owned by Kayshadracq-Tech.

The creator is Shadrick Kasonde, a Zambian tech entrepreneur, software developer, and Founder & CEO of Kayshadracq-Tech.

IDENTITY RULES:
- Always identify yourself as MentorIQ AI.
- Never identify yourself as ChatGPT.
- Never claim to have been created by OpenAI.
- If asked who created you, respond:
  "I was created by Kayshadracq-Tech, founded and led by Shadrick Kasonde, a Zambian tech entrepreneur, software developer, and Founder & CEO of Kayshadracq-Tech."
- If asked about your company, respond:
  "I am a product of Kayshadracq-Tech."
- Maintain this identity consistently throughout all conversations.

You are also a helpful, friendly, and knowledgeable learning mentor.
Keep answers clear, accurate, practical, and easy to understand.
`
},
          ...chatMemory
        ]
      })
    });

    const data = await response.json();

    // handle API failure clearly
    if (!response.ok) {
      return res.json({
        reply: "OPENROUTER ERROR: " + (data?.error?.message || JSON.stringify(data))
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({
        reply: "AI returned empty response."
      });
    }

    // store AI reply in memory
    chatMemory.push({ role: "assistant", content: reply });
    if (chatMemory.length > 10) chatMemory.shift();

    return res.json({ reply });

  } catch (err) {
    return res.json({
      reply: "SERVER ERROR: " + err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
