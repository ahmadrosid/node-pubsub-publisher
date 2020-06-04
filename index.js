const { PubSub } = require("@google-cloud/pubsub");
require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

app.post("/", async (req, res) => {
  let data = req.body;
  let topicName = env("PUBSUB_TOPIC_NAME");
  if (req.body.topic) {
    topicName = data.topic;
    data = data.data;
  }

  await publish(data, topicName)
    .then((messageId) => {
      res.send(
        { status: true, messageId: messageId, topic: topicName, data: data },
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(422).send({ status: false, message: err });
    });
});

app.listen(port, () => console.log(`Server run at http://localhost:${port}`));

const env = (variable) => {
  return process.env[variable];
};

async function publish(input, topicName) {
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
    const dataBuffer = Buffer.from(data);

    return await pubSubClient.topic(topicName).publish(dataBuffer);
  }

  return publishMessage();
}
