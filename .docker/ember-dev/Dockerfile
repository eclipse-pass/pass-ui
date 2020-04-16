FROM alpine:3.7

WORKDIR /app

RUN apk add --no-cache nodejs-npm && \
    apk add --no-cache --virtual .build-deps git && \
    yarn global add ember-cli

CMD yarn install && ember server --port $EMBER_PORT
