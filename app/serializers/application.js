import { camelize } from '@ember/string';
import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(attr) {
    return attr ? camelize(attr) : null;
  }

  keyForRelationship(key) {
    return key ? camelize(key) : null;
  }
}
