'use strict';

module.exports = {
  singleQuote: true,
  printWidth: 120,
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: '*.hbs',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.{js,ts}',
      options: {
        singleQuote: true,
      },
    },
    {
      files: '*.{gjs,gts}',
      options: {
        singleQuote: true,
      },
    },
  ],
};
