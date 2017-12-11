import { helper } from '@ember/component/helper';

export function valueOf([thing]) {
  if (typeof thing === 'function') {
    return thing();
  }

  return thing;
}

export default helper(valueOf);
