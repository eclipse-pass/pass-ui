#! /bin/sh

# Wait until Fedora, Elasticsearch, and indexer are up

# Read docker configuration
. .env

# Wait until Elasticsearch is up and indexer has created index
# The indexer has already waited for Fedora before creating index.
function wait_until_indexer_up {
    CMD="curl -I --write-out %{http_code} --silent -o /dev/stderr ${FEDORA_ADAPTER_ES_INDEX}"
    echo "Waiting for response from Elasticsearch via ${CMD}"

    RESULT=0
    max=20
    i=1

    until [ ${RESULT} -eq 200 ]
    do
        sleep 5

        RESULT=$(${CMD})

        if [ $i -eq $max ]
        then
           echo "Reached max attempts"
           exit 1
        fi

        i=$((i+1))
        echo "Trying again, result was ${RESULT}"
    done

    echo "Elasticsearch index is available"
}

wait_until_indexer_up
