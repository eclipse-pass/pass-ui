#!/bin/bash

ENV_FILE=$@

echo "Using .env file at ($ENV_FILE)"

if [ ! -e $ENV_FILE ]; then
  echo "Must specify .env file. './build.sh <env_filepath>'"
  exit 1
fi

# Export all properties from the .env file
# Ignore any SIGNING_CERT* variables
unamestr=$(uname)
if [ "$unamestr" = 'Linux' ]; then
  export $(grep -v '^[#|SIGNING|PASS_CORE_POLICY]' $ENV_FILE | xargs -d '\n')
elif [ "$unamestr" = 'FreeBSD' ] || [ "$unamestr" = 'Darwin' ]; then
  export $(grep -v '^[#|SIGNING|PASS_CORE_POLICY]' $ENV_FILE | xargs -0)
fi

rm -rf dist/

pnpm install --frozen-lockfile
pnpm run build:dev
pnpm run build:latest

# For unambiguous naming to be used in local dev docker-compose env
# Do not push this tag
docker tag ghcr.io/eclipse-pass/pass-ui:latest ui-local
