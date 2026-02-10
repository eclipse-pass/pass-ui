import { helper } from '@ember/component/helper';

export default helper(function objectAt([index, array]) {
  if (!Array.isArray(array)) return undefined;
  return array[index];
});
