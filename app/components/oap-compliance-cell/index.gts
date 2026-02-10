import Component from '@glimmer/component';

export default class OapComplianceCell extends Component {
  get isStalled(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grant = (this.args as any).grant;
    if (grant?.submissions) {
      for (const submission of grant.submissions) {
        if (submission.deposits) {
          for (const deposit of submission.deposits) {
            if (deposit.depositStatus === 'stalled') {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  <template>
    {{#if this.isStalled}}
      <div class='text-center'>
        <p><i class='fas fa-circle mr-1'></i>
          <span class='test'>stalled (<a href='#'>?</a>)</span></p>
      </div>
    {{else}}
      no issues detected
    {{/if}}
  </template>
}
