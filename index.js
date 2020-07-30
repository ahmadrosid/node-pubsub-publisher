require("dotenv").config();
const { v4 }  = require('uuid');
const { PubSub } = require("@google-cloud/pubsub");
var opentracing = require('opentracing');
var lightstep   = require('lightstep-tracer');

const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

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
	const tracsactionID = v4();
	let spanContext = {}
	opentracing.globalTracer().inject(span.context(), opentracing.FORMAT_TEXT_MAP, spanContext);

	span.setTag('kind', 'pubsubEvent');
	span.setTag('guid:transaction_id', tracsactionID);

	let data = req.body;
	let topicName = env("PUBSUB_TOPIC_NAME");
	if (req.body.topic) {
		topicName = data.topic;
		data = data.data;
	}

	span.log({ event: 'Start publish pubsub message' })
	await publish(data, topicName, tracsactionID, JSON.stringify(spanContext))
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

async function publish(input, topicName, tracsactionID, spanContext) {
  const data = JSON.stringify(input);
  const pubSubClient = new PubSub();

  async function publishMessage() {
	const dataBuffer = Buffer.from(data);
	const attributes = {
		transactionId: tracsactionID,
		spanContext: spanContext
	};

    return await pubSubClient.topic(topicName).publish(dataBuffer, attributes);
  }

  return publishMessage();
}
