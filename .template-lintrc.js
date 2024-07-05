'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-at-ember-render-modifiers': 'off',
    'no-builtin-form-components': 'off',
  },
};
