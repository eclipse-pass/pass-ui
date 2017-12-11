import { helper } from '@ember/component/helper';

export function workflowFor([obj, name]) {
  var workflows = obj.get('workflows');
  if (workflows) {
    console.log("Existing workflows " + workflows.map(wf => wf.get('name')));
    console.log("Will return workflow " + workflows.find((wf) => wf.get('name') === name));
    return workflows.find((wf) => wf.get('name') === name);
  }
}

export default helper(workflowFor);
