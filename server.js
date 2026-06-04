import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", (req, res) => {
  const message = (req.body.message || "").toLowerCase().trim();

  let reply = "";

  // Greetings
  if (message.includes("hi") || message.includes("hello")) {
    reply = "Hello 👋 I am MentorIQ AI. How can I help you today?";
  }

  // Name question
  else if (message.includes("your name")) {
    reply = "My name is MentorIQ AI 🤖";
  }

  // Computer studies
  else if (message.includes("computer")) {
    reply = "A computer is an electronic device that processes data and information. It has hardware and software.";
  }

  // Math
  else if (message.includes("2+2")) {
    reply = "2 + 2 = 4";
  }

  else if (message.includes("math")) {
    reply = "I can help you with Math. Try asking a simple equation like 2+2.";
  }

  // Help
  else if (message.includes("help")) {
    reply = "I can help you with Math, Computer Studies, and general learning topics.";
  }

  // Yes response
  else if (message === "yes") {
    reply = "Great 👍 Please tell me exactly what you need help with.";
  }

  // Default fallback
  else {
    reply = "I am still learning 🤖. Try asking about math, computer studies, or greetings.";
  }

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
