FROM nginxinc/nginx-unprivileged:1.27.3-alpine

ARG EMBER_ROOT_URL
ARG USER_SERVICE_URL
ARG SCHEMA_SERVICE_URL
ARG DOI_SERVICE_URL
ARG POLICY_SERVICE_URL

ENV USER_SERVICE_URL=${USER_SERVICE_URL:-/pass-user-service/whoami} \
    SCHEMA_SERVICE_URL=${SCHEMA_SERVICE_URL:-/schemaservice} \
    DOI_SERVICE_URL=${DOI_SERVICE_URL:-/doiservice/journal} \
    POLICY_SERVICE_URL=${POLICY_SERVICE_URL:-/policies} \
    PASS_UI_ROOT_URL=${EMBER_ROOT_URL:-/app/} \
    METADATA_SCHEMA_URI=${METADATA_SCHEMA_URI:-https://oa-pass.github.com/metadata-schemas/jhu/global.json} \
    MANUSCRIPT_SERVICE_LOOKUP_URL=${MANUSCRIPT_SERVICE_LOOKUP_URL:-/downloadservice/lookup} \
    MANUSCRIPT_SERVICE_DOWNLOAD_URL=${MANUSCRIPT_SERVICE_DOWNLOAD_URL:-/downloadservice/download} \
    PASS_API_URL=${PASS_API_URL:-https://localhost} \
    PASS_API_NAMESPACE=${PASS_API_NAMESPACE:-/api/v1} \
    STATIC_CONFIG_URL=${STATIC_CONFIG_URL:-/app/config.json} \
    PASS_UI_PORT=80

USER root

COPY .docker/bin/entrypoint.sh /bin/
COPY .docker/nginx-template.conf /
COPY ./pass-ui-*-cyclonedx-sbom.json /
COPY ./dist/ /usr/share/nginx/html/app/

RUN apk --no-cache add gettext && \
    chmod a+x /bin/entrypoint.sh && \
    chown nginx:nginx /bin/entrypoint.sh && \
    chown nginx:nginx /nginx-template.conf && \
    chown -R nginx:nginx /usr/share/nginx/html/app

USER nginx

ENTRYPOINT [ "/bin/entrypoint.sh" ]
