const { PubSub } = require("@google-cloud/pubsub");
require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

app.post("/", async (req, res) => {
  const messageId = await publish(req.body).catch(err => {
    res.statusCode = 500;
    res.send({ status: false, message: err });
  });
  console.log(`Message ${messageId} published.`);

  res.send({ status: true, messageId: messageId });
});

app.listen(port, () => console.log(`Server run at http://localhost:${port}`));

const env = (variable) => {
  return process.env[variable];
};

async function publish(input) {
  const topicName = env("PUBSUB_TOPIC_NAME");
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
    const dataBuffer = Buffer.from(data);

    return await pubSubClient.topic(topicName).publish(dataBuffer);
  }

  return publishMessage()
}
