import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('submission-action-cell', 'Integration | Component | submission action cell', {
  integration: true
});

test('it renders', function (assert) {
  let record = {};

  // TODO: add actual tests here
  record = Ember.Object.create({
    preparers: []
  });

  this.set('record', record);

  this.render(hbs`{{submission-action-cell record=record}}`);

  assert.equal(this.$().text().trim(), 'No actions available.');

  // Template block usage:
  this.render(hbs`
    {{#submission-action-cell record=record}}
      template block text
    {{/submission-action-cell}}
  `);

  assert.equal(this.$().text().trim(), 'No actions available.');
});
