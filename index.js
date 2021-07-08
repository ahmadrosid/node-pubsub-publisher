require("dotenv").config();
const { PubSub } = require("@google-cloud/pubsub");

const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const env = (variable) => {
	return process.env[variable];
};

app.post("/", async (req, res) => {
	span.setTag('kind', 'pubsubEvent');
	span.setTag('guid:transaction_id', tracsactionID);

	let data = req.body;
	let topicName = env("PUBSUB_TOPIC_NAME");
	if (req.body.topic) {
		topicName = data.topic;
		data = data.data;
	}

	span.log({ event: 'Start publish pubsub message' })
	await publish(data, topicName)
	.then((messageId) => {
		res.send({ status, messageId, topic, data });
	})
	.catch((err) => {
		console.log(err);
		res.status(422).send({ status: false, message: err });
	});
});

app.listen(port, () => console.log(`Server run at http://localhost:${port}`));

async function publish(input, topicName) {
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
	const dataBuffer = Buffer.from(data);
    return await pubSubClient.topic(topicName).publish(dataBuffer, attributes);
  }

  return publishMessage();
}
