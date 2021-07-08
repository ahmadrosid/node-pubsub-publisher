# Node Pubsub Publisher
This project is designed to help when you're working with pubsub. Only for publishing pubsub messages.

## Install
```bash
npm install
```

## Run server
Please create pubsub project topic and add to your local env.
```
cp .env.example .env
```

### Environment Variable
| Name | Description |
| -------------------- | ----------- |
| GOOGLE_APPLICATION_CREDENTIALS | GCP google-secret.json file |
| PUBSUB_TOPIC_NAME | Default pubsub topic name |

Run the app :
```bash
npm start
```

## Publish message

### 1. Publish to default topic
```bash
curl --request POST \
  --url http://localhost:3000/ \
  --header 'content-type: application/json' \
  --data '{
	"hello": "world"
}'
```

### 2. Publish to custom topic
```bash
curl --request POST \
  --url http://localhost:3000/ \
  --header 'content-type: application/json' \
  --data '{
	"topic": "topic-name",
	"data": {
		"first_name": "Judy",
		"last_name": "Fox"
	}
}'
```