const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const N8N_WEBHOOK_URL = "https://dephenominal.app.n8n.cloud/webhook-test/n8n"; // your webhook

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages array." });
    }

    const userMessage = messages[messages.length - 1]?.content || "Empty prompt";

    // Send message to n8n webhook
    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, {
      prompt: userMessage,
    });

    const reply = n8nResponse.data?.reply || "[No reply from n8n]";

    // Return OpenAI-style response to ElevenLabs
    res.json({
      id: "chatcmpl-n8n",
      object: "chat.completion",
      created: Date.now(),
      model: model || "n8n-logical-agent",
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
    console.error("n8n error:", error.response?.data || error.message);

    res.status(500).json({
      error: "n8n request failed",
      details: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ n8n proxy running on http://localhost:${PORT}/v1/chat/completions`);
});
