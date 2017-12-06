import { helper } from '@ember/component/helper';

// By default return Date.toDateString()

export function dateFormatter([date]) {
  if (date) {
    return (date.getMonth() + 1) + '/' + (date.getDate() + 1) + '/' + date.getFullYear();
  } else {
    return '';
  }
}

export default helper(dateFormatter);
