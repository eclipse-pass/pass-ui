import { helper } from '@ember/component/helper';

// By default return Date.toDateString()

export function dateFormatter([date]) {
  if (date && typeof date === 'function') {
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  }
  return '';
}

export default helper(dateFormatter);
