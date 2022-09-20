import Transform from '@ember-data/serializer/transform';
import { dasherize, underscore } from '@ember/string';

/**
 * Some model attributes are represented by enumerations on the backend.
 * These values were previously represented by by dasherized string
 * values. However, due to a bug in our demo endpoint, the values have
 * changed to underscored strings.
 *
 * This transform will dynamically change the value back to the
 * dasherized value for the Ember side and back to the underscore
 * value when passed to the backend.
 *
 * TODO: we can have a proper enum implementation here by passing
 * the possible values in `options` and checking values at
 * serialization time.
 */
export default class EnumTransform extends Transform {
  serialize(deserialized, options) {
    return deserialized ? underscore(deserialized).toUpperCase() : null;
  }
  deserialize(serialized, options) {
    return serialized ? dasherize(serialized).toLowerCase() : null;
  }
}
