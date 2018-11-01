import { moduleForComponent, test, setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';


module('Integration | Component | workflow-review', (hooks) => {
  setupRenderingTest(hooks);
  test('it renders', function (assert) {
    let model = {};

    // TODO: add actual tests here
    model = Ember.Object.create({
      newSubmission: Ember.Object.create({
        metadata: '[]',
        repositories: []
      })
    });
    let isValidated = true;
    this.set('isValidated', isValidated);
    let filesTemp = '[]';
    this.set('filesTemp', filesTemp);
    this.set('model', model);

    render(hbs`{{workflow-review model=model isValidated=isValidated filesTemp=filesTemp}}`);
    assert.ok(true);
  });
});
