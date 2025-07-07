const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyCL6VLUyQk01ZaAvNkb0rMivDFA9CP9dg4"; // ✅ Your working Gemini API key

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages } = req.body;

    // Convert OpenAI-style messages into Gemini-compatible format
    const promptParts = messages.map(msg => ({
      role: "user", // Gemini only accepts user role in each turn
      parts: [{ text: msg.content }]
    }));

    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      { contents: promptParts },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        }
      }
    );

    // Extract assistant's full reply
    const parts = geminiResponse.data.candidates?.[0]?.content?.parts;
    const content = parts?.map(p => p.text).join("\n") || "[No reply]";

    res.json({
      id: "chatcmpl-gemini",
      object: "chat.completion",
      created: Date.now(),
      model: "gemini-1.5-flash",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: content
          },
          finish_reason: "stop"
        }
      ]
    });
  } catch (error) {
    console.error("Gemini error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Gemini request failed",
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Gemini proxy running on https://your-render-url/v1/chat/completions`);
});
