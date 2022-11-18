#! /bin/bash

docker compose -f ../pass-docker/demo.yml -f .docker/docker-compose.dev.yml --env-file ../pass-docker/.demo_env $@
