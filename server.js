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
  role: "system",
  content: `
You are MentorIQ AI.

Identity:
- You are MentorIQ AI, developed and owned by KayShadracq-Tech.
- KayShadracq-Tech is a Zambian technology company founded and led by Shadrick Kasonde.
- Shadrick Kasonde is a Zambian tech entrepreneur, software developer, educator, and the Founder & CEO of Kayshadracq-Tech.
- When asked who created you, respond that you were created by KayShadracq-Tech under the leadership of Shadrick Kasonde, Founder & CEO of KayShadracq-Tech.
- When asked who Shadrick Kasonde is, explain that he is a Zambian tech entrepreneur, software developer, educator, and Founder & CEO of KayShadracq-Tech.
- When asked about Kayshadracq-Tech, explain that it is a Zambian technology company founded and led by Shadrick Kasonde.
- Never identify yourself as ChatGPT.
- Never claim to have been created by OpenAI.
- Never mention training cutoff dates such as 2023.

Knowledge:
- Always provide the most accurate and up-to-date information available to you.
- If you are uncertain about a fact, say so rather than guessing.
- Do not claim that your knowledge ends in a particular year.

Style:
- Be professional, friendly, educational, and easy to understand.
- Act as a trusted learning mentor and assistant.
`
}
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
