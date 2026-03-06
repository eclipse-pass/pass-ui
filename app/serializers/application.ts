const camelize = (str: string) => str.replace(/[-_\s]+(.)?/g, (_: string, c: string) => (c ? c.toUpperCase() : ''));
const dasherize = (str: string) =>
  str
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase();
import { singularize } from '@warp-drive/utilities/string';
import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(attr: string) {
    return attr ? camelize(attr) : null;
  }

  keyForRelationship(key: string) {
    return key ? camelize(key) : null;
  }

  payloadKeyFromModelName(model: string) {
    return model ? singularize(camelize(model)) : null;
  }

  modelNameFromPayloadKey(key: string) {
    return key ? singularize(dasherize(key)) : null;
  }
}
