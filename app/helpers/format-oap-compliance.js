import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function formatOapCompliance([compliance]) {
  if (!compliance) {
    return '';
  }

  const value = compliance.toLowerCase();

  if (value === 'yes') {
    return (htmlSafe(`<span class='text-success'>${compliance}</span>`));
  } else if (value === 'no') {
    return (htmlSafe(`<span class='text-danger'>${compliance}</span>`));
  }

  return '';
}

export default helper(formatOapCompliance);
