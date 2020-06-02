# Node Pubsub Publisher
This project is for helper when you are working with pubsub. Only for publish pubsub message.

## Install
```bash
npm install
```

## Run server
Please create pubsub project topic and add to your local env.
```
cp .env.example .env
```

Run the app :
```bash
npm start
```

## Publish message
```bash
curl --request POST \
  --url http://localhost:3000/ \
  --header 'content-type: application/json' \
  --data '{
	"hello": "world"
}'
```
