import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize(serialized) {
    console.log("Serializing: " + JSON.stringify(serialized));
    return serialized;
  },

  serialize(deserialized) {
    console.log("Deserializing: " + JSON.stringify(deserialized));
    return deserialized;
  }
});
