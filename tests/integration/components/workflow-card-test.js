import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('workflow-card', 'Integration | Component | workflow card', {
  integration: true
});

test('it renders', function(assert) {
  this.set("nothing", () => {});
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{workflow-card save=(action nothing) cancel=(action nothing) continue=(action nothing)}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#workflow-card save=(action nothing) cancel=(action nothing) continue=(action nothing)}}
      template block text
    {{/workflow-card}}
  `);

  assert.ok(this.$());
});
