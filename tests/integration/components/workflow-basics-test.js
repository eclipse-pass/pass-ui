import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('workflow-basics', 'Integration | Component | workflow basics', {
  integration: true
});

test('it renders', function (assert) {
  let model = {};

  model = Ember.Object.create({
    newSubmission: Ember.Object.create({
    })
  });

  this.set('model', model);

  this.render(hbs`{{workflow-basics model=model}}`);
  assert.ok(true);
});
