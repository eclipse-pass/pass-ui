import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | submissions/new/basics', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    assert.ok(controller);
  });

  test('ensure email format validation works', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({
      submitterEmailDisplay: 'badtestemail',
      repositories: [],
      grants: [],
    });
    let model = {
      newSubmission: submission,
    };
    controller.set('model', model);
    assert.true(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'bademail.com');
    assert.true(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'bad|#$~email.com');
    assert.true(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'mailto:bad@email.com');
    assert.true(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'bad@email+com');
    assert.true(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'good@email.com');
    assert.false(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'good.email@email.co.uk');
    assert.false(controller.get('submitterEmailIsInvalid'));

    controller.set('model.newSubmission.submitterEmailDisplay', 'good_email55@ema-il.co.uk');
    assert.false(controller.get('submitterEmailIsInvalid'));
  });

  test('check submitter validation', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({
      repositories: [],
      grants: [],
    });
    let submitter = EmberObject.create({
      id: 'https://fake.id',
    });
    let model = {
      newSubmission: submission,
    };
    controller.set('model', model);
    assert.true(controller.get('submitterEmailIsInvalid'));
    assert.true(controller.get('submitterIsInvalid'));

    controller.set('model.newSubmission.submitterName', 'Test Name');
    controller.set('model.newSubmission.submitterEmail', 'mailto:good@email.com');
    assert.false(controller.get('submitterIsInvalid'));

    controller.set('model.newSubmission.submitterName', null);
    controller.set('model.newSubmission.submitterEmailDisplay', null);
    controller.set('model.newSubmission.submitter', submitter);
    assert.false(controller.get('submitterIsInvalid'));
  });

  test('check title and journal validation', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({});
    let publication = EmberObject.create({
      journal: [],
    });
    let model = {
      newSubmission: submission,
      publication,
    };
    controller.set('model', model);
    assert.true(controller.get('journalIsInvalid'));
    assert.true(controller.get('titleIsInvalid'));

    controller.set('model.publication.title', 'Test title');
    assert.false(controller.get('titleIsInvalid'));

    controller.set('model.publication.journal.id', 'test:journal_id');
    assert.false(controller.get('journalIsInvalid'));

    controller.set('model.publication.journal.id', null);
    controller.set('model.publication.journal.journalName', 'Test journal name');
    assert.false(controller.get('journalIsInvalid'));
  });

  test('check validateAndLoadTab rejects empty publication title but not journal title', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({});
    let publication = EmberObject.create({
      journal: [],
    });
    let model = {
      newSubmission: submission,
      publication,
    };
    controller.set('model', model);
    assert.false(controller.get('titleError'));
    assert.false(controller.get('journalError'));
    assert.strictEqual(controller.get('flaggedFields').indexOf('title'), -1);
    assert.strictEqual(controller.get('flaggedFields').indexOf('journal'), -1);

    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.true(controller.get('titleError'));
    assert.false(controller.get('journalError'));
    assert.ok(controller.get('flaggedFields').indexOf('title') > -1);
    assert.strictEqual(controller.get('flaggedFields').indexOf('journal'), -1);
  });

  test('check validateAndLoadTab rejects incomplete submitter', function (assert) {
    assert.expect(9);
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let loadTabAccessed = false;
    let submission = EmberObject.create({
      isProxySubmission: true,
    });
    let publication = EmberObject.create({
      title: 'Test publication title',
      journal: {
        id: 'journal:id',
      },
    });
    let model = {
      newSubmission: submission,
      publication,
    };
    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = () => {
      assert.ok(true);
      loadTabAccessed = true;
    };

    // this will error if it proceeds to loadTab.
    assert.true(controller.get('model.newSubmission.isProxySubmission'));
    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.true(controller.get('submitterIsInvalid'));
    // no flagged fields in this instance and loadTab not accessed
    assert.false(controller.get('titleError'));
    assert.false(controller.get('journalError'));
    assert.false(controller.get('submitterEmailError'));
    assert.strictEqual(controller.get('flaggedFields').indexOf('journal'), -1);
    assert.strictEqual(controller.get('flaggedFields').indexOf('title'), -1);
    assert.strictEqual(controller.get('flaggedFields').indexOf('submitterEmail'), -1);
    assert.false(loadTabAccessed);
  });

  test('check validateAndLoadTab accepts complete information', function (assert) {
    assert.expect(11);

    let subSaved = false;

    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({
      isProxySubmission: true,
      submitterName: 'Test Submitter',
      submitterEmail: 'mailto:test@email.com',
      submitterEmailDisplay: 'test@email.com',
      save: () => {
        assert.ok(true);
        subSaved = true;
        return Promise.resolve();
      },
    });
    let publication = EmberObject.create({
      title: 'Test publication title',
      journal: {
        id: 'journal:id',
      },
      save() {
        assert.ok(true);
        return Promise.resolve();
      },
    });
    let model = {
      newSubmission: submission,
      publication,
    };

    controller.set('model', model);
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = () => {
      // no errors and loadTab accessed
      assert.false(controller.get('submitterIsInvalid'));
      assert.false(controller.get('titleError'));
      assert.false(controller.get('journalError'));
      assert.false(controller.get('submitterEmailError'));
      assert.strictEqual(controller.get('flaggedFields').indexOf('journal'), -1);
      assert.strictEqual(controller.get('flaggedFields').indexOf('title'), -1);
      assert.strictEqual(controller.get('flaggedFields').indexOf('submitterEmail'), -1);

      assert.ok(subSaved, 'submission was not saved');
    };

    assert.true(controller.get('model.newSubmission.isProxySubmission'));
    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });
});
