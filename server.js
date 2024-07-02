const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
});

const broadcastLog = (message) => {
    const logMessage = JSON.stringify({ timestamp: new Date(), message });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(logMessage);
      }
    });
  };

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

async function main(){
  const key = "790453df6bc94ea199526f3083aca293";
  const endpoint = "https://nmva-gpt.openai.azure.com/";
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

  const deploymentId = "gpt-4";

  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Can you help me?" },
  ];

  console.log(`Messages: ${messages.map((m) => m.content).join("\n")}`);

  const events = await client.streamChatCompletions(deploymentId, messages, { maxTokens: 128 });
  for await (const event of events) {
    for (const choice of event.choices) {
      const delta = choice.delta?.content;
      if (delta !== undefined) {
        console.log(`Chatbot: ${delta}`);
        broadcastLog(`Chatbot: ${delta}`);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});


