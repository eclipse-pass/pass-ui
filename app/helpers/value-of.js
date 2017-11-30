import { helper } from '@ember/component/helper';

/** Finds the ultimate value of a value or function 
 * 
 * If the given parameter is a value, this helper just returns it unmodified.
 * If the given parameter is a function, this helper invokes the function
 * and returns the resulting value
 * 
*/
export function valueOf([something]) {
  if (typeof something === 'function') {
    return something();
  }

  return something;
}

export default helper(valueOf);
