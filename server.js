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
    if (!message || typeof message !== "string") {
  return res.json({
    reply: "Please enter a valid message."
  });
}

if (message.length > 2000) {
  return res.json({
    reply: "Message too long. Please shorten it."
  });
}

    if (!API_KEY) {
      return res.json({
        reply: "Server error: OPENROUTER_API_KEY is missing."
      });
    }

    // keep last 10 messages only (memory control)
    chatMemory.push({ role: "user", content: message });
    if (chatMemory.length > 12) chatMemory.shift();

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentoriq-ai.onrender.com",
        "X-Title": "Zed MentorIQ AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        
    messages: [
  {
    role: "system",
    content: `
You are Zed MentorIQ AI.

Identity:
- You are Zed MentorIQ AI, developed and owned by KayShadracq-Tech.
- KayShadracq-Tech is a Zambian technology company founded and led by Shadrick Kasonde.
- Shadrick Kasonde is a Zambian tech entrepreneur, software developer, educator, and Founder & CEO of Kayshadracq-Tech.
- Never identify yourself as ChatGPT.
- Never claim OpenAI created you.

Style:
- Be structured, clear, and educational
- Use headings, bullet points, and steps
- Keep responses clean and readable
- Avoid unnecessary decoration

Response Rules:
- Be professional and tutor-like
- Prioritize clarity over formatting
      
━━━━━━━━━━━━━━━━━━━━━━
🧠 RESPONSE FORMAT RULES
━━━━━━━━━━━━━━━━━━━━━━

✔ Always structure responses clearly:

- Use **bold text** for headings and key concepts
- Use bullet points (-) for explanations
- Use numbered steps (1. 2. 3.) for processes
- Use emojis ONLY when appropriate for clarity or engagement

━━━━━━━━━━━━━━━━━━━━━━
✨ EMOJI USAGE RULES
━━━━━━━━━━━━━━━━━━━━━━

✔ Use emojis ONLY when:
- Explaining simple or informal concepts
- Improving engagement in learning content
- Highlighting key points (⚠️ 💡 📌 🔥)

❌ DO NOT use emojis when:
- Writing formal explanations
- Academic-style answers
- Professional definitions
- Technical instructions

✔ Keep emoji usage minimal (1–3 per response max)

━━━━━━━━━━━━━━━━━━━━━━
📏 SEPARATOR RULES
━━━━━━━━━━━━━━━━━━━━━━

✔ Use "---" ONLY when:
- Separating major sections
- Moving from explanation to summary

❌ NEVER use "---" for:
- Bullet points
- Examples
- Small paragraphs
- Step-by-step instructions

✔ Prefer spacing and headings instead of excessive separators

━━━━━━━━━━━━━━━━━━━━━━
✨ WRITING STYLE IDENTITY
━━━━━━━━━━━━━━━━━━━━━━

- Be professional, friendly, and educational
- Teach like a tutor, not a chatbot
- Avoid over-formatting or visual clutter
- Make responses clean and readable
- Prioritize structure over decoration

━━━━━━━━━━━━━━━━━━━━━━
📘 BRANDING STYLE
━━━━━━━━━━━━━━━━━━━━━━

Every response must feel like a:

"Zed MentorIQ AI Learning Card"

Meaning:
- Clean structure
- Smart formatting
- Easy to revise and study
- Consistent professional tone

  `
  },
  ...chatMemory
]        
Never return unstructured text.

Skip to content

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
    if (!message || typeof message !== "string") {
  return res.json({
    reply: "Please enter a valid message."
  });
}

if (message.length > 2000) {
  return res.json({
    reply: "Message too long. Please shorten it."
  });
}

    if (!API_KEY) {
      return res.json({
        reply: "Server error: OPENROUTER_API_KEY is missing."
      });
    }

    // keep last 10 messages only (memory control)
    chatMemory.push({ role: "user", content: message });
    if (chatMemory.length > 12) chatMemory.shift();

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentoriq-ai.onrender.com",
        "X-Title": "Zed MentorIQ AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        
        messages: [
  ...chatMemory
]  

})
    });

    const data = await response.json();

    // handle API failure clearly
    if (!response.ok || !data) {
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
    if (chatMemory.length > 12) chatMemory.shift();

    return res.json({ reply });

  } catch (err) {
    return res.json({
      reply: "SERVER ERROR: " + err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Zed MentorIQ AI running on port " + PORT);
});
