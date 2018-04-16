import { helper } from '@ember/component/helper';

export function workflowFor([obj, name]) {
  const workflows = obj.get('workflows');
  if (workflows) {
    return workflows.find(wf => wf.get('name') === name);
  }
}

export default helper(workflowFor);
