import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { click, waitFor } from '@ember/test-helpers';
import swal from 'pass-ui/util/swal';

module('Unit | Utility | swal', (hooks) => {
  setupTest(hooks);

  hooks.afterEach(function (assert) {
    // close() normally waits for the hide animation before removing the popup and undoing the
    // aria-hidden it put on the rest of the page. Turn the animation off so all of that happens
    // now, and a popup (some are mounted on document.body) can't outlive this test.
    document.querySelectorAll<HTMLElement>('.swal2-popup').forEach((popup) => {
      popup.style.animation = 'none';
      popup.style.transition = 'none';
    });
    swal.close();
    assert.dom('.swal2-container', document.body).doesNotExist('the popup is gone after the test');
    assert.dom('#ember-testing-container[aria-hidden]', document.body).doesNotExist('the page is no longer hidden');
  });

  test('dialog is announced by its title and description, not as a live region', async function (assert) {
    swal.fire({
      target: '#ember-testing',
      title: 'Are you sure?',
      text: 'If you delete this file, it will be gone forever.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'I Agree',
    });

    const popup = document.querySelector('.swal2-popup') as HTMLElement;
    assert.dom(popup).hasAttribute('role', 'dialog');
    assert.dom(popup).hasAttribute('aria-modal', 'true');
    assert.dom(popup).doesNotHaveAttribute('aria-live');

    const labelledBy = popup.getAttribute('aria-labelledby');
    const describedBy = popup.getAttribute('aria-describedby');
    assert.dom(`#${labelledBy}`).hasText('Are you sure?', 'dialog is named by its title');
    assert.dom(`#${describedBy}`).hasText('If you delete this file, it will be gone forever.');

    assert.dom('.swal2-icon').hasAttribute('aria-hidden', 'true', 'decorative icon is hidden from AT');
    assert.dom('.swal2-icon-content').hasText('!');
  });

  test('fixes survive swal.update() and nested mixins', async function (assert) {
    const Queue = swal.mixin({ target: '#ember-testing', showCancelButton: true });
    Queue.fire({ title: 'Step one', icon: 'error' });

    assert.dom('.swal2-popup').doesNotHaveAttribute('aria-live');
    assert.dom('.swal2-icon').hasAttribute('aria-hidden', 'true');

    swal.update({ icon: 'info' });

    assert.dom('.swal2-popup').doesNotHaveAttribute('aria-live');
    assert.dom('.swal2-icon').hasAttribute('aria-hidden', 'true');
  });

  test('positional fire(title, text, icon) arguments are also fixed', async function (assert) {
    swal.fire('Comment field empty', 'Please add a comment.', 'warning');

    assert.dom('.swal2-popup', document.body).doesNotHaveAttribute('aria-live');
    assert.dom('.swal2-icon', document.body).hasAttribute('aria-hidden', 'true');
  });

  test("a call's own didRender does not remove the fixes", async function (assert) {
    let ownHookRan = false;
    swal.fire({
      target: '#ember-testing',
      title: 'Custom render',
      icon: 'warning',
      didRender: () => {
        ownHookRan = true;
      },
    });

    assert.true(ownHookRan, "the call's own didRender still runs");
    assert.dom('.swal2-popup').doesNotHaveAttribute('aria-live');
    assert.dom('.swal2-icon').hasAttribute('aria-hidden', 'true');
  });

  test('validation messages are announced in their own live region', async function (assert) {
    swal.fire({
      target: '#ember-testing',
      title: 'Choose one',
      input: 'radio',
      inputOptions: { agree: 'I agree', decline: 'I decline' },
      inputValidator: (value: string) => (value ? null : 'You need to choose something!'),
    });

    assert
      .dom('.swal2-validation-message')
      .hasAttribute('aria-live', 'polite', 'the message is its own live region')
      .hasAttribute('aria-atomic', 'true');

    await click('.swal2-confirm');
    await waitFor('.swal2-validation-message:not([style*="display: none"])');
    assert.dom('.swal2-validation-message').hasText('You need to choose something!');
  });
});
