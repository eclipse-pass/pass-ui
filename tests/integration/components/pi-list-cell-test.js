import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pi-list-cell', 'Integration | Component | pi list cell', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('record', {
    pi: {
      name: 'Bob'
    },
    copis: [
      {
        name: 'Yoda'
      }, {
        name: 'Luke'
      }
    ]
  });

  this.render(hbs`{{pi-list-cell record=record}}`);

  assert.ok(this.$().text().includes('Bob'));
  assert.ok(this.$().text().includes('Yoda'));
  assert.ok(this.$().text().includes('Luke'));

  // Template block usage:
  this.render(hbs`
    {{#pi-list-cell record=record}}
    {{/pi-list-cell}}
  `);

  assert.ok(this.$().text().includes('Bob'));
  assert.ok(this.$().text().includes('Yoda'));
  assert.ok(this.$().text().includes('Luke'));
});
