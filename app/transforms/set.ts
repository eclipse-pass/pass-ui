import Transform from '@ember-data/serializer/transform';

export default class SetTransform extends Transform {
  deserialize(serialized: unknown): unknown[] | undefined {
    if (Array.isArray(serialized)) {
      return serialized;
    }
  }

  serialize(deserialized: unknown): unknown[] | undefined {
    if (Array.isArray(deserialized)) {
      return deserialized;
    }
  }
}
