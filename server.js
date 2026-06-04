import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase();

  let reply = "I am MentorIQ AI 🤖";

  if (message.includes("hello")) {
    reply = "Hello 👋 I'm MentorIQ AI, your learning assistant.";
  }

  else if (message.includes("name")) {
    reply = "My name is MentorIQ AI.";
  }

  else if (message.includes("math")) {
    reply = "I can help with Math. Ask me a question.";
  }

  else if (message.includes("computer")) {
    reply = "I can help you with Computer Studies.";
  }

  else if (message.includes("who are you")) {
    reply = "I am an AI chatbot built to help you learn.";
  }

  else {
    reply = "I am still learning 🤖. Try asking about math, computers, or greetings.";
  }

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
