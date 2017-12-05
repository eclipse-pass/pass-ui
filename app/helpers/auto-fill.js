import { helper } from '@ember/component/helper';

export function autoFill([obj, field, defaultValue]) {
  if (obj) {
    var valueFromObject = obj.get(field);

    if (!valueFromObject && defaultValue) {
      obj.set(field, defaultValue);
    }

    return obj.get(field);
  }
}

export default helper(autoFill);
