import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('identifier-cell', 'Integration | Component | identifier cell', {
  integration: true
});

test('it renders', function (assert) {
  this.set('column', {
    propertyName: 'id'
  });

  this.set('record', {
    id: {
      label: 'foo',
      uri: 'http://example.com/'
    }
  });

  this.render(hbs`{{identifier-cell record=record column=column}}`);

  assert.equal(this.$('a').attr('href'), 'http://example.com/');
  assert.equal(this.$('a').text().trim(), 'foo');

  // Template block usage:

  this.render(hbs`
    {{#identifier-cell record=record column=column}}
    {{/identifier-cell}}
  `);

  assert.equal(this.$('a').attr('href'), 'http://example.com/');
  assert.equal(this.$('a').text().trim(), 'foo');
});
