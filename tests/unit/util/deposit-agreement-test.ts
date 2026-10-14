import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { focus, triggerKeyEvent } from '@ember/test-helpers';
import swal from 'pass-ui/util/swal';
import { depositAgreementHtml } from 'pass-ui/util/deposit-agreement';

module('Unit | Utility | deposit-agreement', (hooks) => {
  setupTest(hooks);

  hooks.afterEach(function () {
    swal.close();
  });

  const fireAgreement = (text: string) =>
    swal.fire({
      target: '#ember-testing',
      title: 'Deposit requirements for JScholarship',
      html: depositAgreementHtml('JScholarship', text),
      input: 'radio',
      inputOptions: { agree: 'I agree', noAgree: 'I do not agree' },
    });

  test('agreement is a named, focusable region inside the dialog', async function (assert) {
    fireAgreement('NON-EXCLUSIVE LICENSE FOR USE OF MATERIALS');

    const region = '.swal2-popup[role="dialog"] .swal2-html-container [data-test-deposit-agreement]';
    assert.dom(region, document.body).exists('agreement is inside the dialog');
    assert.dom(region, document.body).hasAttribute('role', 'region');
    assert.dom(region, document.body).hasAttribute('tabindex', '0');
    assert.dom(region, document.body).hasAttribute('aria-label', 'Deposit agreement for JScholarship');
    assert.dom(region, document.body).hasText('NON-EXCLUSIVE LICENSE FOR USE OF MATERIALS');
  });

  test("SweetAlert's focus trap includes the agreement", async function (assert) {
    fireAgreement('License text');

    const region = document.querySelector('[data-test-deposit-agreement]') as HTMLElement;
    const firstRadio = document.querySelector('.swal2-radio input') as HTMLElement;

    await focus(firstRadio);
    await triggerKeyEvent(firstRadio, 'keydown', 'Tab', { shiftKey: true });
    assert.strictEqual(document.activeElement, region, 'Shift+Tab from the first option reaches the agreement');

    await triggerKeyEvent(region, 'keydown', 'Tab');
    assert.strictEqual(document.activeElement, firstRadio, 'Tab from the agreement moves on to the options');
  });

  test('repository name is escaped in the accessible name', function (assert) {
    const container = document.createElement('div');
    container.innerHTML = depositAgreementHtml('A "quoted" <repo>', 'text');
    assert.strictEqual(container.children.length, 1);
    assert.strictEqual(
      container.firstElementChild!.getAttribute('aria-label'),
      'Deposit agreement for A "quoted" <repo>',
    );
  });
});
