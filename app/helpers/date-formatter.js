import { helper } from '@ember/component/helper';

// By default return Date.toDateString()

export function dateFormatter([date]) {
  if (date) {
    return date.toDateString();
  } else {
    return '';
  }
}

export default helper(dateFormatter);
