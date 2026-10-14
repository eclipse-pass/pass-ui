import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import swal from 'pass-ui/util/swal';

module('Unit | Utility | swal', (hooks) => {
  setupTest(hooks);

  hooks.afterEach(function () {
    swal.close();
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
});
