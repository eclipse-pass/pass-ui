import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('date-cell', 'Integration | Component | date cell', {
  integration: true
});

test('it renders', function(assert) {
  this.set('column', {
    propertyName: 'date'
  });


  this.set('record', {
      date: new Date('2010-01-20')
  });

  this.render(hbs`{{date-cell record=record column=column}}`);

  assert.equal(this.$().text().trim(), '1/20/2010');

  // Template block usage:
  this.render(hbs`
    {{#date-cell record=record column=column}}
    {{/date-cell}}
  `);

  assert.equal(this.$().text().trim(), '1/20/2010');
});
