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
    },

    api: {
      host: 'http://localhost:8080',
      namespace: 'rest/pass'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  if (process.env.PASS_FEDORA_HOST) {
    ENV.api.host = process.env.PASS_FEDORA_HOST;
  }

  if (process.env.PASS_FEDORA_PORT) {
    ENV.api.port = process.env.PASS_FEDORA_PORT;
  }

  if (process.env.PASS_FEDORA_PATH) {
    ENV.api.namespace = process.env.PASS_FEDORA_PATH;
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

  return ENV;
};
