#! /bin/bash

PASS_DOCKER_DIR="${PASS_DOCKER_DIR:-"../pass-docker/"}"
PASS_DOCKER_DIR="${PASS_DOCKER_DIR%/}/" # Add trailing slash if necessary

echo "Using pass-docker: $PASS_DOCKER_DIR"
# Set location of pass-ui as inline env var
# Used by the compose file override for file system bind mounts
PASS_UI_DIR=$(pwd) docker compose -f "${PASS_DOCKER_DIR}eclipse-pass.base.yml" -f "${PASS_DOCKER_DIR}eclipse-pass.local.yml" -f ./docker-compose.dev.yml $@
