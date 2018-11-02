import { moduleForComponent, test, setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module } from 'qunit';
import { render } from '@ember/test-helpers';


module('Integration | Component | workflow metadata', (hooks) => {
  setupRenderingTest(hooks);
  test('it renders', function (assert) {
    let model = {};

    // TODO: add actual tests here
    model.newSubmission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    model.metadataForms = [Ember.Object.create()];

    let doiInfo = Ember.Object.create();

    this.set('model', model);
    this.set('doiInfo', doiInfo);

    console.log('hi there');

    render(hbs`{{workflow-metadata model=model doiInfo=doiInfo}}`);
    assert.ok(true);
  });
});
