import { helper } from '@ember/component/helper';

export default helper(function mapBy([prop, array]) {
  if (!Array.isArray(array)) return [];
  return array.map((item) => item?.[prop]);
});
