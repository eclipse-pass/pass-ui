import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow wrapper', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = EmberObject.create({ });
    let publication = EmberObject.create({ });
    let submissionEvent = EmberObject.create({ });

    this.set('submission', submission);
    this.set('publication', publication);
    this.set('submissionEvents', [submissionEvent]);
    this.set('validateAndLoadTab', (actual) => {});

    this.render(hbs`{{workflow-wrapper
      submission=submission
      publication=publication
      submissionEvents=submissionEvents
      loadTab=(action validateAndLoadTab)}}`);
    assert.ok(true);
  });
});
