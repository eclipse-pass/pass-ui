/* eslint-env node */

'use strict';

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'pass-ui',
    environment,
    rootURL: process.env.PASS_UI_ROOT_URL || '/app/',
    host: process.env.EMBER_HOST || 'http://localhost:8080',
    // Config for ember-data backend calls
    schemaServicePath: process.env.SCHEMA_SERVICE_PATH || '/schemaservice',
    doiService: {
      journalPath: process.env.DOI_SERVICE_PATH || '/doi/journal',
      manuscriptLookUpPath: process.env.MANUSCRIPT_SERVICE_LOOKUP_PUBLIC_PATH || '/doi/manuscript',
    },
    doiMetadataSchemaUri:
      process.env.DOI_METADATA_SCHEMA_URI || 'https://eclipse-pass.github.io/metadata-schemas/jhu/global.json',
    policyService: {
      policyPath: process.env.POLICY_SERVICE_POLICY_PATH || '/policyservice/policies',
      repositoryPath: process.env.POLICY_SERVICE_REPOSITORY_PATH || '/policyservice/repositories',
    },
    fileServicePath: '/file',

    passApi: {
      namespace: process.env.PASS_API_NAMESPACE || 'data',
    },
    locationType: 'auto',
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

  // TODO: move this to test only env once mocks are removed
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
    ENV['ember-cli-mirage'] = {
      enabled: true,
    };
  }

  return ENV;
};
