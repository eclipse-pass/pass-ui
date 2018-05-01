/* eslint-env node */

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'pass-ember',
    environment,
    // rootURL: '/fcrepo/rest',
    rootURL: '/',
    host: 'http://localhost:8080',
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

  if (environment === 'surge') {
    // Application deployed as /pass
    // ENV.rootURL = '/pass/';
    ENV.contentSecurityPolicy = {
      'style-src': "'self' 'unsafe-inline'",
      'script-src': "'self' 'unsafe-eval' http://pass-jhu.surge.sh",
      'connect-src': "'self' http://pass-jhu.surge.sh"
    };
  }

  // Disable mirage entirely.
  ENV['ember-cli-mirage'] = {
    enabled: true
  };

  ENV.fedora = {
    base: 'http://localhost:8080/fcrepo/rest',
    context: 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-2.0.jsonld',
    // context: 'http://example.org/pass/',
    data: 'http://example.org/pass/',
    username: 'admin',
    password: 'moo'
  };
  /*
   * So we are supposed to set all the context related URLs to 'http://example.org/pass' (?)
   * However the COMPACTION_URI (at least) has to be the 'real' context, or else the
   * ember-fedora-adapter complains. I just don't know how to get the local copy of the
   * context (should be deployed along side pass-docker stuff)
   */
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
