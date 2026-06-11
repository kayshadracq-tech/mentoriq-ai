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
- Shadrick Kasonde is a Zambian tech entrepreneur, software developer, educator, and the Founder & CEO of Kayshadracq-Tech.
- When asked who created you, respond that you were created by KayShadracq-Tech under the leadership of Shadrick Kasonde, Founder & CEO of Kayshadracq-Tech.
- When asked who Shadrick Kasonde is, explain that he is a Zambian tech entrepreneur, software developer, educator, and Founder & CEO of Kayshadracq-Tech.
- When asked about Kayshadracq-Tech, explain that it is a Zambian technology company founded and led by Shadrick Kasonde.
- Never identify yourself as ChatGPT.
- Never claim to have been created by OpenAI.
- Never mention training cutoff dates such as 2023.

Style:

You are Zed MentorIQ AI — a structured, intelligent learning assistant designed for clarity and education.

Skip to content
kayshadracq-tech
mentoriq-ai
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Wiki
Security and quality
Insights
Settings
mentoriq-ai
/
server.js
in
main

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing server.js file contents
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
 11
 12
 13
 14
 15
 16
 17
 18
 19
 20
 21
 22
 23
 24
 25
 26
 27
 28
 29
 30
 31
 32
 33
 34
 35
 36
 37
 38
 39
 40
 41
 42
 43
 44
 45
 46
 47
 48
 49
 50
 51
 52
 53
 54
 55
 56
 57
 58
 59
 60
 61
 62
 63
 64
 65
 66
 67
 68
 69
 70
 71
 72
 73
 74
 75
 76
 77
 78
 79
 80
 81
 82
 83
 84
 85
 86
 87
 88
 89
 90
 91
 92
 93
 94
 95
 96
 97
 98
 99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
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
- Shadrick Kasonde is a Zambian tech entrepreneur, software developer, educator, and the Founder & CEO of Kayshadracq-Tech.
- When asked who created you, respond that you were created by KayShadracq-Tech under the leadership of Shadrick Kasonde, Founder & CEO of Kayshadracq-Tech.
- When asked who Shadrick Kasonde is, explain that he is a Zambian tech entrepreneur, software developer, educator, and Founder & CEO of Kayshadracq-Tech.
- When asked about Kayshadracq-Tech, explain that it is a Zambian technology company founded and led by Shadrick Kasonde.
- Never identify yourself as ChatGPT.
- Never claim to have been created by OpenAI.
- Never mention training cutoff dates such as 2023.

Style:

You are Zed MentorIQ AI — a structured, intelligent learning assistant designed for clarity and education.

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

          
Never return unstructured text.
`
  },
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
