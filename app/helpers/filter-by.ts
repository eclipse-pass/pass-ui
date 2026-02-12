import { helper } from '@ember/component/helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default helper(function filterBy([prop, value, array]: [string, any, any]) {
  if (!array) {
    // When called as (filter-by "prop" array) with 2 args
    array = value;
    return Array.isArray(array) ? array.filter((item) => item?.[prop]) : [];
  }
  return Array.isArray(array) ? array.filter((item) => item?.[prop] === value) : [];
});
