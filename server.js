
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const HF_API =
  "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await fetch(HF_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: message
      })
    });

    const data = await response.json();

    const reply =
      data?.[0]?.generated_text ||
      "MentorIQ AI is thinking... try again.";

    res.json({ reply });
  } catch (err) {
    res.json({ reply: "Error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("MentorIQ AI running on port " + PORT);
});
