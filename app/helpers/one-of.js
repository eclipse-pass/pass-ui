import { helper } from '@ember/component/helper';

/** Returns the first non-null value in the given params */
export function oneOf(params) {
  return params.find((val) => { if (val) return val; });
}

export default helper(oneOf);
