import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | workflow basics', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', function (assert) {
    let submission = Ember.Object.create({
      repositories: [],
      grants: []
    });
    let publication = Ember.Object.create({});
    let preLoadedGrant = Ember.Object.create({});
    let flaggedFields = [];
    let doiInfo = [];
    this.set('submission', submission);
    this.set('publication', publication);
    this.set('preLoadedGrant', preLoadedGrant);
    this.set('doiInfo', doiInfo);
    this.set('flaggedFields', '[]');
    // pass in actions that do nothing
    this.set('validateTitle', (actual) => { });
    this.set('validateJournal', (actual) => { });
    this.set('validateSubmitterEmail', (actual) => { });
    this.set('loadNext', (actual) => {});

    this.render(hbs`{{workflow-basics
      submission=submission
      publication=publication
      preLoadedGrant=preLoadedGrant
      doiInfo=doiInfo
      flaggedFields=flaggedFields
      validateTitle=(action validateTitle)
      validateJournal=(action validateJournal)
      validateSubmitterEmail=(action validateSubmitterEmail)
      next=(action loadNext)}}`);
    assert.ok(true);
  });
});
