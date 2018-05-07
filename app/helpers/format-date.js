import { helper } from '@ember/component/helper';

export function formatDate(params/*, hash*/) { // eslint-disable-line
  const date = new Date(params);
  try {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    if (dd < 10) { dd = `0${dd}`; }
    if (mm < 10) { mm = `0${mm}`; }
    return `${mm}/${dd}/${yyyy}`;
  } catch (e) {
    return '';
  }
}

export default helper(formatDate);
