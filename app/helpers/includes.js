import { helper } from '@ember/component/helper';

export default helper(function includes([haystack, needle]) {
  if (!haystack) return false;
  if (Array.isArray(haystack)) return haystack.includes(needle);
  if (typeof haystack === 'string') return haystack.includes(needle);
  return false;
});
