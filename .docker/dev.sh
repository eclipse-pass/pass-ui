#! /bin/bash

PASS_DOCKER_DIR="${PASS_DOCKER_DIR:-"../pass-docker/"}"
# Add trailing slash if necessary
PASS_DOCKER_DIR="${PASS_DOCKER_DIR%/}/"

docker compose -f "${PASS_DOCKER_DIR}demo.yml" -f .docker/docker-compose.dev.yml --env-file "${PASS_DOCKER_DIR}.demo_env" $@
