import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('identifier-cell', 'Integration | Component | identifier cell nolink', {
  integration: true
});

test('it renders', function(assert) {
  this.set('column', {
    propertyName: 'id'
  });

  this.set('record', {
      id: {
        label: 'foo'
      }
  });

  this.render(hbs`{{identifier-cell record=record column=column}}`);
  assert.equal(this.$().text().trim(), 'foo');

  // Template block usage:

  this.render(hbs`
    {{#identifier-cell record=record column=column}}
    {{/identifier-cell}}
  `);
  assert.equal(this.$().text().trim(), 'foo');
  
  //check empty uri works as well
  this.set('record', {
      id: {
        label: 'foo',
		uri:''
      }
  });

  this.render(hbs`{{identifier-cell record=record column=column}}`);
  assert.equal(this.$().text().trim(), 'foo');

});
