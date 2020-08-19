import Transform from '@ember-data/serializer/transform';

export default Transform.extend({
  deserialize(serialized, options) {
    if (Array.isArray(serialized)) {
      return serialized;
    }
  },
  serialize(deserialized, options) {
    if (Array.isArray(deserialized)) {
      return deserialized;
    }
  }
});
