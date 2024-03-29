/* eslint-env node */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const stringHash = require('string-hash');

const disableCssModules = ['/pass-ui/styles/app.css', '/pass-ui/styles/font-awesome-5-0-13.css'];

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

    cssModules: {
      generateScopedName(className, modulePath) {
        if (!disableCssModules.includes(modulePath)) {
          let hash = stringHash(modulePath).toString(36).substring(0, 6);
          let scopedName = `_${className}_${hash}`;

          return scopedName;
        }

        return className;
      },
    },
    fingerprint: {
      enabled: false,
    },
    'ember-test-selectors': {
      strip: false,
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

  return app.toTree();
};
