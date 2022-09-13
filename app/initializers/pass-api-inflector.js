import Inflector from 'ember-inflector';

/**
 * Our API current does not use pluralized model names for its endpoints
 * So we need to change default ember-data behavior to get the API calls
 * right.
 */
export function initialize() {
  const inflector = Inflector.inflector;

  // Tell the inflector to not pluralize our model names
  // by saying the plural is the same word
  inflector.uncountable('contributor');
  inflector.uncountable('deposit');
  inflector.uncountable('file');
  inflector.uncountable('funder');
  inflector.uncountable('grant');
  inflector.uncountable('journal');
  inflector.uncountable('person');
  inflector.uncountable('policy');
  inflector.uncountable('publication');
  inflector.uncountable('publisher');
  inflector.uncountable('repositoryCopy');
  inflector.uncountable('repository');
  inflector.uncountable('submissionEvent');
  inflector.uncountable('submission');
  inflector.uncountable('user');
}

export default {
  name: 'pass-api-inflector',
  initialize,
};
