#!/bin/bash

ENV_FILE=$@

echo "Using .env file at ($ENV_FILE)"

if [ ! -e $ENV_FILE ]; then
  echo "Must specify .env file. './build.sh <env_filepath>'"
  exit 1
fi

# Export all properties from the .env file
unamestr=$(uname)
if [ "$unamestr" = 'Linux' ]; then
  export $(grep -v '^#' $ENV_FILE | xargs -d '\n')
elif [ "$unamestr" = 'FreeBSD' ] || [ "$unamestr" = 'Darwin' ]; then
  export $(grep -v '^#' $ENV_FILE | xargs -0)
fi

cat $ENV_FILE

ember build

docker build --no-cache -t eclipse-pass/ui:local .
