import DS from 'ember-data';

export default DS.Transform.extend({
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
