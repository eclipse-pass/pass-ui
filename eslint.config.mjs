import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import ember from 'eslint-plugin-ember/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import qunit from 'eslint-plugin-qunit';
import n from 'eslint-plugin-n';
import babelParser from '@babel/eslint-parser';

export default ts.config(
  js.configs.recommended,
  ember.configs.base,
  ember.configs.gjs,
  ember.configs.gts,
  eslintConfigPrettier,
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      'declarations/',
      'tmp/',
      'bower_components/',
      '!**/.*',
      '.*/',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          configFile: false,
          babelrc: false,
          plugins: [['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]],
        },
      },
    },
  },
  {
    files: ['**/*.{js,gjs}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.{ts,gts}'],
    languageOptions: {
      parser: ember.parser,
    },
    extends: [...ts.configs.recommended, ember.configs.gts],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.{js,ts,gjs,gts}'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off',
      'no-redeclare': 'off',
      'ember/no-runloop': 'off',
      'ember/no-tracked-properties-from-args': 'off',
    },
  },
  {
    files: ['tests/**/*-test.{js,gjs,ts,gts}'],
    plugins: {
      qunit,
    },
  },
  {
    files: [
      '**/*.cjs',
      'config/**/*.js',
      'testem.js',
      '.prettierrc.js',
      '.stylelintrc.js',
      '.template-lintrc.js',
      'babel.config.cjs',
    ],
    plugins: {
      n,
    },
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.mjs'],
    plugins: {
      n,
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.node,
      },
    },
  },
);
