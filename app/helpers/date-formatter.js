import { helper } from '@ember/component/helper';

// By default return Date.toDateString()

export function dateFormatter([date]) {
  return date.toDateString();
}

export default helper(dateFormatter);
