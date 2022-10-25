/* eslint-env node */

'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'pass-ui',
    environment,
    rootURL: process.env.PASS_UI_ROOT_URL || '/app/',
    host: process.env.EMBER_HOST || 'http://localhost:8080',
    // Config for ember-data backend calls
    passApi: {
      namespace: process.env.PASS_API_NAMESPACE || 'api/v1',
    },
    locationType: 'auto',
    'ember-load': {
      // This is the default value, if you don't set this opton
      loadingIndicatorClass: 'app-loader',
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // This is available in the app by calling PassEmber.varName
      staticConfigUri: process.env.STATIC_CONFIG_URL || '/app/config.json',
    },
  };

  ENV['ember-cli-mirage'] = {
    enabled: true,
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.APP.autoboot = false;
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    // Disable mirage entirely.
    ENV['ember-cli-mirage'] = {
      enabled: true,
    };
  }

  ENV.userService = {
    url: '/pass-user-service/whoami',
  };

  ENV.doiService = {
    url: '/doiservice/journal',
  };

  ENV.schemaService = {
    url: '/schemaservice',
  };

  ENV.policyService = {
    policyEndpoint: '/policyservice/policies',
    repositoryEndpoint: '/policyservice/repositories',
  };

  ENV.oaManuscriptService = {
    lookupUrl: '/downloadservice/lookup',
    downloadUrl: '/downloadservice/download',
  };

  ENV.doiMetadataSchemaUri = 'https://eclipse-pass.github.io/metadata-schemas/jhu/global.json';

  if (process.env.PASS_UI_ROOT_URL) {
    ENV.rootURL = process.env.PASS_UI_ROOT_URL;
  }

  if (process.env.EMBER_MIRAGE_ENABLED) {
    ENV['ember-cli-mirage'].enabled = !!process.env.EMBER_MIRAGE_ENABLED;
  }

  if (process.env.USER_SERVICE_PUBLIC_URL) {
    ENV.userService.url = process.env.USER_SERVICE_PUBLIC_URL;
  }

  if (process.env.SCHEMA_SERVICE_PUBLIC_URL) {
    ENV.schemaService.url = process.env.SCHEMA_SERVICE_PUBLIC_URL;
  }

  if (process.env.DOI_SERVICE_PUBLIC_URL) {
    ENV.doiService.url = process.env.DOI_SERVICE_PUBLIC_URL;
  }

  if (process.env.METADATA_SCHEMA_URI) {
    ENV.doiMetadataSchemaUri = process.env.DOI_METADATA_SCHEMA_URI;
  }

  if (process.env.POLICY_SERVICE_POLICY_ENDPOINT) {
    ENV.policyService.policyEndpoint = process.env.POLICY_SERVICE_POLICY_ENDPOINT;
  }

  if (process.env.POLICY_SERVICE_REPOSITORY_ENDPOINT) {
    ENV.policyService.repositoryEndpoint = process.env.POLICY_SERVICE_REPOSITORY_ENDPOINT;
  }

  if ('MANUSCRIPT_SERVICE_LOOKUP_PUBLIC_URL' in process.env) {
    ENV.oaManuscriptService.lookupUrl = process.env.MANUSCRIPT_SERVICE_LOOKUP_PUBLIC_URL;
  }

  if ('MANUSCRIPT_SERVICE_DOWNLOAD_PUBLIC_URL' in process.env) {
    ENV.oaManuscriptService.downloadUrl = process.env.MANUSCRIPT_SERVICE_DOWNLOAD_PUBLIC_URL;
  }

  return ENV;
};
