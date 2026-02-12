import { helper } from '@ember/component/helper';

export default helper(function isEqual([a, b]) {
  return a === b;
});
