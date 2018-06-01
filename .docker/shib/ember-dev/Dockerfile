FROM alpine:3.7

WORKDIR /app

RUN apk add --no-cache nodejs-npm && \
    apk add --no-cache --virtual .build-deps git && \
    npm install -g ember-cli

CMD npm install && ember server --port $EMBER_PORT
