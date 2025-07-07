const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyCL6VLUyQk01ZaAvNkb0rMivDFA9CP9dg4"; // Replace if needed

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages array." });
    }

    // Transform OpenAI-style messages to Gemini-compatible
    const promptParts = messages.map((msg) => ({
      role: "user",
      parts: [{ text: msg.content }],
    }));

    // Make Gemini API call
    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      { contents: promptParts },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GEMINI_API_KEY,
        },
      }
    );

    // Extract Gemini response
    const candidates = geminiResponse.data.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const reply = parts.map((p) => p.text).join("\n") || "[No reply]";

    // Return OpenAI-style response to ElevenLabs
    res.json({
      id: "chatcmpl-gemini",
      object: "chat.completion",
      created: Date.now(),
      model: model || "gemini-1.5-flash",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: reply,
          },
          finish_reason: "stop",
        },
      ],
    });
  } catch (error) {
    console.error("Gemini error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Gemini request failed",
      details: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Gemini proxy running on http://localhost:${PORT}/v1/chat/completions`);
});
s