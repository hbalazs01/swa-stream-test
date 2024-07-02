const express = require('express');
const path = require('path');
const appInsights = require('applicationinsights');
const app = express();
const port = process.env.PORT || 3000;

appInsights.setup('46a9690c-01a8-4f5b-94a9-8ec2e6bea7f9').start(); // Replace with your Instrumentation Key
const client = appInsights.defaultClient;

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
        client.trackTrace({ message: `Chatbot: ${delta}` });
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});


