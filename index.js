const { PubSub } = require("@google-cloud/pubsub");
require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

app.post("/", (req, res) => {
  publish(req.body);
  res.send({ status: true });
});

app.listen(port, () => console.log(`Server run at http://localhost:${port}`));

const env = (variable) => {
  return process.env[variable];
};

function publish(input) {
  const topicName = env("PUBSUB_TOPIC_NAME");
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
    const dataBuffer = Buffer.from(data);

    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  }

  publishMessage().catch(console.error);
}
