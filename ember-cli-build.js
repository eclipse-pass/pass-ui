/* eslint-env node */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const stringHash = require('string-hash');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    inlineContent: {
      'initial-state': './initial-state.html',
    },

    'ember-composable-helpers': {
      only: ['queue', 'compute', 'invoke', 'includes'],
    },

    autoImport: {
      forbidEval: true,
    },

    '@embroider/macros': {
      setConfig: {
        '@ember-data/store': {
          polyfillUUID: true,
        },
      },
    },

    fingerprint: {
      enabled: false,
    },

    'ember-test-selectors': {
      strip: false,
    },

    'ember-bootstrap': {
      bootstrapVersion: 5,
      importBootstrapCSS: false,
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('node_modules/ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-structure.css');
  app.import('node_modules/ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-appearance.css');
  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [],
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    amdCompatibility: {
      es: [],
    },
    // splitAtRoutes: ['route.name'], // can also be a RegExp
    // packagerOptions: {
    //    webpackConfig: { }
    // }
  });
};
