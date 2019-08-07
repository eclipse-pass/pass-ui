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

    APP: { // This is available in the app by calling PassEmber.varName
      assetsUri: '/',
      brand: {
        mailto: 'pass@jhu.edu',
        homepage: '',
        logo: '',
        stylesheet: '',
        fontUrl: 'fonts/',
        imgUrl: 'img/'
      }
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

  ENV.fedora = {
    base: 'http://localhost:8080/fcrepo/rest/',
    context: 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.4.jsonld',
    data: 'http://oapass.org/ns/pass#',
    elasticsearch: 'http://localhost:9200/pass/_search'
  };
  ENV.userService = {
    url: 'https://pass.local:8080/pass-user-service/whoami'
  };

  ENV.doiService = {
    url: 'https://pass.local/doiservice/journal'
  };

  ENV.schemaService = {
    url: 'https://pass.local:8086'
  };

  ENV.policyService = {
    url: 'https://pass.local/policyservice',
    policySuffix: '/policies',
    repoSuffix: '/repositories',
    // policyEndpoint: 'https://pass.local/policyservice/policies',
    // repositoryEndpoint: 'https://pass.local/policyservice/repositories'
  };

  ENV.metadataSchemaUri = 'https://oa-pass.github.io/metadata-schemas/jhu/global.json';

  if (process.env.STATIC_ASSETS_URI) {
    ENV.APP.assetsUri = process.env.STATIC_ASSETS_URI;
  }

  if (process.env.EMBER_ROOT_URL) {
    ENV.rootURL = process.env.EMBER_ROOT_URL;
  }

  if (process.env.USER_SERVICE_URL) {
    ENV.userService.url = process.env.USER_SERVICE_URL;
  }

  if (process.env.SCHEMA_SERVICE_URL) {
    ENV.schemaService.url = process.env.SCHEMA_SERVICE_URL;
  }

  if (process.env.DOI_SERVICE_URL) {
    ENV.doiService.url = process.env.DOI_SERVICE_URL;
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

  if (process.env.METADATA_SCHEMA_URI) {
    ENV.metadataSchemaUri = process.env.METADATA_SCHEMA_URI;
  }

  if (process.env.POLICY_SERVICE_URL) {
    ENV.policyService.url = process.env.POLICY_SERVICE_URL;
  }

  if (process.env.POLICY_SERVICE_POLICY_ENDPOINT) {
    ENV.policyService.policyEndpoint = process.env.POLICY_SERVICE_POLICY_ENDPOINT;
  }

  if (process.env.POLICY_SERVICE_REPOSITORY_ENDPOINT) {
    ENV.policyService.repositoryEndpoint = process.env.POLICY_SERVICE_REPOSITORY_ENDPOINT;
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

  if (process.env.BRAND_MAILTO) {
    ENV.APP.brand.mailto = process.env.BRAND_MAILTO;
  }
  if (process.env.BRAND_FONT_URL) {
    ENV.APP.brand.fontUrl = process.env.BRAND_FONT_URL;
  }
  if (process.env.BRAND_IMG_URL) {
    ENV.APP.brand.imgUrl = process.env.BRAND_IMG_URL;
  }

  return ENV;
};
