import { camelize, dasherize } from '@ember/string';
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
