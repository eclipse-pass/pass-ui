import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('workflow-wrapper', 'Integration | Component | workflow wrapper', {
  integration: true
});

test('it renders', function (assert) {
  let model = {};

  // TODO: add actual tests here
  model = Ember.Object.create({
    newSubmission: Ember.Object.create({
    })
  });

  this.set('model', model);

  this.render(hbs`{{workflow-wrapper model=model}}`);
  assert.ok(true);
});
