import { moduleForComponent, test, setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';


module('Integration | Component | workflow grants', (hooks) => {
  setupRenderingTest(hooks);
  test('it renders', function (assert) {
    let model = {};

    // TODO: add actual tests here
    model.newSubmission = Ember.Object.create({
      repositories: [
      ],
      grants: [
        Ember.Object.create({
          primaryFunder: Ember.Object.create({
          })
        }),
      ]
    });
    model.repositories = [];
    let maxStep = 2;

    this.set('model', model);
    this.set('maxStep', maxStep);

    render(hbs`{{workflow-grants model=model maxStep=maxStep}}`);
    assert.ok(true);
  });
});
