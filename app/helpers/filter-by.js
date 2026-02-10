import { helper } from '@ember/component/helper';

export default helper(function filterBy([prop, value, array]) {
  if (!array) {
    // When called as (filter-by "prop" array) with 2 args
    array = value;
    return Array.isArray(array) ? array.filter((item) => item?.[prop]) : [];
  }
  return Array.isArray(array) ? array.filter((item) => item?.[prop] === value) : [];
});
