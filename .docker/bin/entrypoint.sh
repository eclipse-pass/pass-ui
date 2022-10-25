#!/bin/sh

envsubst < /nginx-template.conf > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'