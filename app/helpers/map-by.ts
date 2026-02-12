import { helper } from '@ember/component/helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default helper(function mapBy([prop, array]: [string, any[]]) {
  if (!Array.isArray(array)) return [];
  return array.map((item) => item?.[prop]);
});
