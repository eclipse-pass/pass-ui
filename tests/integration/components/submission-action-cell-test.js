import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click, settled } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Integration | Component | submission action cell', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const mockStore = Service.extend({
      query() {
        return Promise.resolve(A());
      }
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);
    });
  });

  test('it renders', async function (assert) {
    let record = {};

    // TODO: add actual tests here
    record = EmberObject.create({
      preparers: [],
      submitted: true
    });

    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}} />`);

    assert.equal(this.element.textContent.trim(), 'No actions available.');

    // Template block usage:
    await render(hbs`
      <SubmissionActionCell @record={{this.record}}>
        template block text
      </SubmissionActionCell>
    `);

    assert.equal(this.element.textContent.trim(), 'No actions available.');
  });

  /**
   * Make sure that the 'deleteSubmission' action calls `submission#deleteRecord` on the
   * supplied submission, then `#save()` should be called
   */
  test('should delete and persist submission', async function (assert) {
    assert.expect(3);

    const record = EmberObject.create({
      preparers: A(),
      isDraft: true,
      save() {
        assert.ok(true);
        return Promise.resolve();
      },
      unloadRecord() {
        assert.ok(true);
        return Promise.resolve();
      }
    });

    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}}></SubmissionActionCell>`);
    await click('a.delete-button');
    await click(document.querySelector('.swal2-confirm'));

    await settled();

    const status = this.get('record.submissionStatus');
    assert.equal(status, 'cancelled');
  });

  test('Draft submissions should display Edit and Delete buttons', async function (assert) {
    const record = EmberObject.create({
      preparers: A(),
      isDraft: true
      // submissionStatus: 'draft'
    });
    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}}></SubmissionActionCell>`);

    const buttons = this.element.querySelectorAll('a');

    assert.ok(buttons, 'No buttons were found');
    assert.equal(buttons.length, 2, `There should be two buttons, instead, ${buttons.length} were found`);
    assert.equal(buttons[0].textContent.trim(), 'Edit');
    assert.equal(buttons[1].textContent.trim(), 'Delete');
  });
});
