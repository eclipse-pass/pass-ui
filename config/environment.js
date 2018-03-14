/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'pass-ember',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    // Application deployed as /pass
    // ENV.rootURL = '/pass/';
  }

  // Optionally, make app work without web server
  if (process.env.PORTABLE) {
    ENV.rootURL = '';
    ENV.locationType = 'hash';
  }

  ENV.fedora = {
    base: 'http://localhost:8080/rest/pass',
    context: 'https://oa-pass.github.io/pass-data-model/src/main/resources/context.jsonld',
    data: 'http://example.org/pass/',
    username: 'admin',
    password: 'moo'
  }

  if (process.env.FEDORA_ADAPTER_BASE) {
    ENV.fedora.base = process.env.FEDORA_ADAPTER_BASE;
  }

  if (process.env.FEDORA_ADAPTER_CONTEXT) {
    ENV.fedora.context = process.env.FEDORA_ADAPTER_CONTEXT;
  }

  if (process.env.FEDORA_ADAPTER_USER_NAME) {
    ENV.fedora.username = process.env.FEDORA_ADAPTER_USER_NAME;
  }

  if (process.env.FEDORA_ADAPTER_PASSWORD) {
    ENV.fedora.password = process.env.FEDORA_ADAPTER_PASSWORD;
  }

  return ENV;
};
