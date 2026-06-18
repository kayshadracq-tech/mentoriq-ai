import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.static("public"));

const API_KEY = process.env.OPENROUTER_API_KEY;
const URL = "https://openrouter.ai/api/v1/chat/completions";


async function generateImage(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}


 async function editImage(imageBase64, prompt) {
  return {
    prompt,
    image: imageBase64
  };
}

/**
 * SIMPLE MEMORY (per server session)
 * NOTE: resets when Render restarts (free tier limitation)
 */
const chatMemory = [];

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const upload = req.body.upload || null;

    if (!message || typeof message !== "string") {
      return res.json({
        reply: "Please enter a valid message."
      });
    }

const aiMode = req.body.aiMode || {};

const lower = message.toLowerCase();

const isImageRequest =
  aiMode.generateImage ||
  lower.includes("image of") ||
  lower.includes("create image") ||
  lower.includes("generate image") ||
  lower.includes("draw");

const isEditRequest =
  aiMode.editImage ||
  lower.includes("edit") ||
  lower.includes("enhance") ||
  lower.includes("improve") ||
  lower.includes("upscale") ||
  lower.includes("sharpen") ||
  lower.includes("polish") ||
  lower.includes("make clearer") ||
  lower.includes("increase quality");
    
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

    // Store user message
    let userContent = message;

if (upload) {
  if (upload.type === "image") {
    // CLEAN STRUCTURED TAG (NO BULK TEXT, NO INSTRUCTIONS INSIDE USER MESSAGE)
    userContent += `

[UPLOAD_TYPE: IMAGE]
[FILE_NAME: ${upload.name}]
[MODE: IMAGE_ANALYSIS]

`;
  } else {
    userContent += `

[UPLOAD_TYPE: FILE]
[FILE_NAME: ${upload.name}]
[FILE_TYPE: ${upload.type}]
[MIME: ${upload.mimeType}]

`;
  }
}
    
chatMemory.push({
  role: "user",
  content: userContent
});

    if (chatMemory.length > 12) {
      chatMemory.shift();
    }


      if (isImageRequest) {
  const imageUrl = await generateImage(message);

  return res.json({
    reply: "Image generated successfully.",
    imageUrl
  });
}

  if (isEditRequest && upload) {
  const payload = await editImage(upload.data, message);

const editedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(payload.prompt)}`;
      
  return res.json({
    reply: "Image edited successfully.",
    imageUrl: editedUrl
  });
  }
    
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
- Shadrick Kasonde is a Zambian tech entrepreneur, software developer, educator, and Founder & CEO of KayShadracq-Tech.
- Never identify yourself as ChatGPT.
- Never claim OpenAI created you.

Style:
- Be structured, clear, and educational.
- Use headings, bullet points, and steps when useful.
- Keep responses clean and readable.
- Be professional and tutor-like.
- Prioritize clarity over formatting.
`
          },
          ...chatMemory
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data) {
      return res.json({
        reply:
          "OPENROUTER ERROR: " +
          (data?.error?.message || JSON.stringify(data))
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({
        reply: "AI returned empty response."
      });
    }

    // Store assistant reply
    chatMemory.push({
      role: "assistant",
      content: reply
    });

    if (chatMemory.length > 12) {
      chatMemory.shift();
    }

    return res.json({
  reply: `${reply}\n\n🤖 Zed MentorIQ AI`
});
    

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
