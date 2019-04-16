import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | submission action cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    let record = {};

    // TODO: add actual tests here
    record = Ember.Object.create({
      preparers: [],
      submitted: true
    });

    this.set('record', record);

    await this.render(hbs`{{submission-action-cell record=record}}`);

    assert.equal(this.$().text().trim(), 'No actions available.');

    // Template block usage:
    await this.render(hbs`
      {{#submission-action-cell record=record}}
        template block text
      {{/submission-action-cell}}
    `);

    assert.equal(this.$().text().trim(), 'No actions available.');
  });

  /**
   * Make sure that the 'deleteSubmission' action calls `submission#deleteRecord` on the
   * supplied submission, then `#save()` should be called
   */
  test('should delete and persist submission', async function (assert) {
    assert.expect(2);

    const record = Ember.Object.create({
      preparers: Ember.A(),
      isDraft: true,
      deleteRecord() {
        assert.ok(true);
      },
      save() {
        assert.ok(true);
        return Promise.resolve();
      }
    });

    this.set('record', record);

    await render(hbs`{{#submission-action-cell record=record}}{{/submission-action-cell}}`);
    await click('a.delete-button');
    await click('.swal2-confirm');
  });

  test('Draft submissions should display Edit and Delete buttons', async function (assert) {
    const record = Ember.Object.create({
      preparers: Ember.A(),
      isDraft: true
      // submissionStatus: 'draft'
    });
    this.set('record', record);

    await render(hbs`{{#submission-action-cell record=record}}{{/submission-action-cell}}`);

    const buttons = this.element.querySelectorAll('a');

    assert.ok(buttons, 'No buttons were found');
    assert.equal(buttons.length, 2, `There should be two buttons, instead, ${buttons.length} were found`);
    assert.equal(buttons[0].textContent.trim(), 'Edit');
    assert.equal(buttons[1].textContent.trim(), 'Delete');
  });
});
