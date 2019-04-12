import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

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
});
