require("dotenv").config();
const { PubSub } = require("@google-cloud/pubsub");
var opentracing = require('opentracing');
var lightstep   = require('lightstep-tracer');

const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

const ID = function () {
	return Math.random().toString(36).substr(2, 60);
};

const env = (variable) => {
	return process.env[variable];
};

var tracer = new lightstep.Tracer({
	component_name : 'node-pubsub-publisher',
	access_token : env('LIGHTSTEP_TOKEN'),
});

opentracing.initGlobalTracer(tracer);

app.post("/", async (req, res) => {
	const span = opentracing.globalTracer().startSpan('pubsubEvent');
	const tracsactionID = ID();
	span.setTag('kind', 'pubsubEvent');
	span.setTag('join:trasaction_id', tracsactionID);

	let data = req.body;
	let topicName = env("PUBSUB_TOPIC_NAME");
	if (req.body.topic) {
		topicName = data.topic;
		data = data.data;
	}

	span.log({ event: 'Start publish pubsub message' })
	await publish(data, topicName, tracsactionID)
	.then((messageId) => {
		span.log({ event: 'Finish publish pubsub message' })
		res.send(
		{ status: true, messageId: messageId, topic: topicName, data: data },
		);
	})
	.catch((err) => {
		span.setTag('error', true);
		console.log(err);
		res.status(422).send({ status: false, message: err });
		span.log({ event: 'Failed publish pubsub message' })
	});
	
	span.finish()
	tracer.flush()
});

app.listen(port, () => console.log(`Server run at http://localhost:${port}`));

async function publish(input, topicName, tracsactionID) {
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
	const dataBuffer = Buffer.from(data);
	const attributes = { lsTransactionId: tracsactionID };

    return await pubSubClient.topic(topicName).publish(dataBuffer, attributes);
  }

  return publishMessage();
}
