import { helper } from '@ember/component/helper';

export function formatDate(params: unknown[] /*, hash*/) {
  const date = new Date(params as unknown as string);
  try {
    let dd: string | number = date.getDate();
    let mm: string | number = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (!(dd && mm && yyyy)) {
      return '';
    }
    return `${mm}/${dd}/${yyyy}`;
  } catch (e) {
    return '';
  }
}

export default helper(formatDate);
