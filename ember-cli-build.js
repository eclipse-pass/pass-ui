/* eslint-env node */

'use strict';
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  let app = new EmberApp(defaults, {
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
  });

  return compatBuild(app, buildOnce, {
    extraPublicTrees: [],
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    amdCompatibility: {
      es: [],
    },
  });
};
