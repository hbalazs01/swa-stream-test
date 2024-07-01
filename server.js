const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

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
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});


