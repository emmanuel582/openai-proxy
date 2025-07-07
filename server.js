const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyBgVYc5d8Ae6Hdq2n9gJLs0U_Mh7idwJEg"; // ✅ Your working Gemini key

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages } = req.body;

    const promptParts = messages.map(msg => ({
      role: "user",
      parts: [{ text: msg.content }]
    }));

    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      { contents: promptParts },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY // ✅ FIXED: correct header for Gemini
        }
      }
    );

    const content = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "[No reply]";

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
