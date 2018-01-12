#!/bin/bash

# Fedora 4 container to setup
REPO="$1"
CREDENTIALS="$2"
LOG="setup_fedora.log"

function create_binary {
    file_path="$1"
    repo_path="$2"
    content_type=$(file -ib "$file_path")

    if [ "$repo_path" == "/" ]; then
	repo_path=""
    fi
	
    repo_path="$REPO/$repo_path"
	
    msg="Creating binary at $repo_path for $file_path"
    echo $msg
    echo -e "\n$msg\n" &>> $LOG
    
    curl -u $CREDENTIALS -# -X PUT --upload-file "$file_path" -H "Content-Type: $content_type" "$repo_path" &>> $LOG

    if [ $? -ne 0 ]; then
	echo "Failed"
	exit
    fi
}

function create_object {
    repo_path="$1"

    if [ "$repo_path" == "/" ]; then
	repo_path=""
    fi
	
    repo_path="$REPO/$repo_path"
    
    msg="Creating object at $repo_path"
    echo $msg
    echo -e "\n$msg\n" &>> $LOG

    curl -u $CREDENTIALS -# -X PUT -H "Content-Type: text/turtle" "$repo_path" &>> $LOG

    if [ $? -ne 0 ]; then
	echo "Failed"
	exit
    fi
}

function delete_object {
    repo_path="$REPO/$1"

    msg="Deleting object at $repo_path"
    echo $msg
    echo -e "\n$msg\n" &>> $LOG

    curl -u $CREDENTIALS -X DELETE "$repo_path" &>> $LOG
    curl -u $CREDENTIALS -X DELETE "$repo_path/fcr:tombstone" &>> $LOG
}

delete_object ""
create_object ""
create_object "grants"
create_object "submissions"
create_object "users"
create_object "funders"
create_object "people"
create_object "identifiers"
create_object "journals"
create_object "publishers"
create_object "deposits"
create_object "workflows"

