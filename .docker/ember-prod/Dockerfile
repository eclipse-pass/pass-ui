FROM node:10.20.1-alpine3.11 as ember-builder

ARG EMBER_GIT_REPO
ARG EMBER_GIT_BRANCH
ARG EMBER_ROOT_URL
ARG USER_SERVICE_URL
ARG SCHEMA_SERVICE_URL
ARG DOI_SERVICE_URL
ARG POLICY_SERVICE_URL

ENV EMBER_GIT_BRANCH=${EMBER_GIT_BRANCH:-master} \
    EMBER_GIT_REPO=${EMBER_GIT_REPO:-https://github.com/eclipse-pass/pass-ui} \
    EMBER_BUILD_DIR=/ember \
    FEDORA_ADAPTER_BASE=/fcrepo/rest/ \
    FEDORA_ADAPTER_DATA=http://oapass.org/ns/pass# \
    FEDORA_ADAPTER_ES=/es/ \
    FEDORA_ADAPTER_PASSWORD="" \
    FEDORA_ADAPTER_USER="" \
    USER_SERVICE_URL=${USER_SERVICE_URL:-/pass-user-service/whoami} \
    SCHEMA_SERVICE_URL=${SCHEMA_SERVICE_URL:-/schemaservice} \
    DOI_SERVICE_URL=${DOI_SERVICE_URL:-/doiservice/journal} \
    POLICY_SERVICE_URL=${POLICY_SERVICE_URL:-/policies} \
    EMBER_ROOT_URL=${EMBER_ROOT_URL:-/app/} \
    METADATA_SCHEMA_URI=${METADATA_SCHEMA_URI:-https://oa-pass.github.com/metadata-schemas/jhu/global.json} \
    MANUSCRIPT_SERVICE_LOOKUP_URL=${MANUSCRIPT_SERVICE_LOOKUP_URL:-/downloadservice/lookup} \
    MANUSCRIPT_SERVICE_DOWNLOAD_URL=${MANUSCRIPT_SERVICE_DOWNLOAD_URL:-/downloadservice/download}

RUN apk add --no-cache git && \
    node -v && npm -v && yarn -v && \
    mkdir -p ${EMBER_BUILD_DIR} && \
    cd ${EMBER_BUILD_DIR} && \
    git clone ${EMBER_GIT_REPO} . && \
    git checkout ${EMBER_GIT_BRANCH} && \
    yarn install && \
    echo "Build environment: " && \
    env | sort && \
    yarn run -B ember build --environment=production && \
    yarn cache clean

FROM nginx:1.13.12-alpine

ARG EMBER_ROOT_URL

ENV EMBER_PORT=80 \
    EMBER_ROOT_URL=${EMBER_ROOT_URL:-/app/}
COPY bin/entrypoint.sh /bin/
COPY nginx-template.conf /

RUN apk --no-cache add gettext && \
    chmod a+x /bin/entrypoint.sh && \
    mkdir /usr/share/nginx/html/app

COPY --from=ember-builder /ember/dist/ /usr/share/nginx/html/app/

ENTRYPOINT [ "/bin/entrypoint.sh" ]