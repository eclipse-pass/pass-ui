import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('date-cell', 'Integration | Component | date cell', {
  integration: true
});

test('it renders', function(assert) {
  this.set('column', {
    propertyName: 'date'
  });

  let date = new Date();

  this.set('record', {
      date: date
  });

  this.render(hbs`{{date-cell record=record column=column}}`);

  assert.equal(this.$().text().trim(), date.toDateString());

  // Template block usage:
  this.render(hbs`
    {{#date-cell record=record column=column}}
    {{/date-cell}}
  `);

  assert.equal(this.$().text().trim(), date.toDateString());
});
