FROM node:10.20.1-alpine3.11

WORKDIR /app

RUN yarn global add ember-cli

CMD yarn install && ember server --port $EMBER_PORT
