/* eslint-env node */

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'pass-ember',
    environment,
    // rootURL: '/fcrepo/rest',
    rootURL: '/',
    host: 'http://localhost:8080',
    locationType: 'auto',
    'ember-load': {
      // This is the default value, if you don't set this opton
      loadingIndicatorClass: 'app-loader'
    },
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
  // Disable mirage entirely.
  ENV['ember-cli-mirage'] = {
    enabled: false
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
    // Disable mirage entirely.
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
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

  ENV.fedora = {
    base: 'http://localhost:8080/fcrepo/rest/',
    context: 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    data: 'http://oapass.org/ns/pass#',
    elasticsearch: 'http://localhost:9200/pass/_search'
  };
  ENV.userService = {
    url: 'https://localhost:8080/pass-user-service/whoami'
  };

  if (process.env.EMBER_ROOT_URL) {
    ENV.rootURL = process.env.EMBER_ROOT_URL;
  }

  if (process.env.USER_SERVICE_URL) {
    ENV.userService.url = process.env.USER_SERVICE_URL;
  }

  if (process.env.FEDORA_ADAPTER_BASE) {
    ENV.fedora.base = process.env.FEDORA_ADAPTER_BASE;
  }

  if (process.env.FEDORA_ADAPTER_CONTEXT) {
    ENV.fedora.context = process.env.FEDORA_ADAPTER_CONTEXT;
  }

  if (process.env.FEDORA_ADAPTER_DATA) {
    ENV.fedora.data = process.env.FEDORA_ADAPTER_DATA;
  }

  if (process.env.FEDORA_ADAPTER_ES) {
    ENV.fedora.elasticsearch = process.env.FEDORA_ADAPTER_ES;
  }

  if ('FEDORA_ADAPTER_USER_NAME' in process.env) {
    ENV.fedora.username = process.env.FEDORA_ADAPTER_USER_NAME;
  } else {
    ENV.fedora.username = 'admin';
  }

  if ('FEDORA_ADAPTER_PASSWORD' in process.env) {
    ENV.fedora.password = process.env.FEDORA_ADAPTER_PASSWORD;
  } else {
    ENV.fedora.password = 'moo';
  }


  return ENV;
};
