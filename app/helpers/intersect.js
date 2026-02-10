import { helper } from '@ember/component/helper';

export default helper(function intersect([...arrays]) {
  if (arrays.length < 2) return [];
  const [first, ...rest] = arrays.filter(Array.isArray);
  if (!first) return [];
  return first.filter((item) => rest.every((arr) => arr.includes(item)));
});
