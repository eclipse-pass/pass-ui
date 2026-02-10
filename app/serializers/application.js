const camelize = (str) => str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
const dasherize = (str) =>
  str
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase();
import { singularize } from 'ember-inflector';
import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(attr) {
    return attr ? camelize(attr) : null;
  }

  keyForRelationship(key) {
    return key ? camelize(key) : null;
  }

  payloadKeyFromModelName(model) {
    return model ? singularize(camelize(model)) : null;
  }

  modelNameFromPayloadKey(key) {
    return key ? singularize(dasherize(key)) : null;
  }
}
