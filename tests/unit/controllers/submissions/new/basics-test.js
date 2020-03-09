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
      grants: []
    });
    let model = {
      newSubmission: submission
    };
    controller.set('model', model);
    assert.equal(controller.get('submitterEmailIsInvalid'), true);

    controller.set('model.newSubmission.submitterEmailDisplay', 'bademail.com');
    assert.equal(controller.get('submitterEmailIsInvalid'), true);

    controller.set('model.newSubmission.submitterEmailDisplay', 'bad|#$~email.com');
    assert.equal(controller.get('submitterEmailIsInvalid'), true);

    controller.set('model.newSubmission.submitterEmailDisplay', 'mailto:bad@email.com');
    assert.equal(controller.get('submitterEmailIsInvalid'), true);

    controller.set('model.newSubmission.submitterEmailDisplay', 'bad@email+com');
    assert.equal(controller.get('submitterEmailIsInvalid'), true);

    controller.set('model.newSubmission.submitterEmailDisplay', 'good@email.com');
    assert.equal(controller.get('submitterEmailIsInvalid'), false);

    controller.set('model.newSubmission.submitterEmailDisplay', 'good.email@email.co.uk');
    assert.equal(controller.get('submitterEmailIsInvalid'), false);

    controller.set('model.newSubmission.submitterEmailDisplay', 'good_email55@ema-il.co.uk');
    assert.equal(controller.get('submitterEmailIsInvalid'), false);
  });

  test('check submitter validation', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({
      repositories: [],
      grants: []
    });
    let submitter = EmberObject.create({
      id: 'https://fake.id'
    });
    let model = {
      newSubmission: submission
    };
    controller.set('model', model);
    assert.equal(controller.get('submitterEmailIsInvalid'), true);
    assert.equal(controller.get('submitterIsInvalid'), true);

    controller.set('model.newSubmission.submitterName', 'Test Name');
    controller.set('model.newSubmission.submitterEmail', 'mailto:good@email.com');
    assert.equal(controller.get('submitterIsInvalid'), false);

    controller.set('model.newSubmission.submitterName', null);
    controller.set('model.newSubmission.submitterEmailDisplay', null);
    controller.set('model.newSubmission.submitter', submitter);
    assert.equal(controller.get('submitterIsInvalid'), false);
  });

  test('check title and journal validation', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({ });
    let publication = EmberObject.create({
      journal: []
    });
    let model = {
      newSubmission: submission,
      publication
    };
    controller.set('model', model);
    assert.equal(controller.get('journalIsInvalid'), true);
    assert.equal(controller.get('titleIsInvalid'), true);

    controller.set('model.publication.title', 'Test title');
    assert.equal(controller.get('titleIsInvalid'), false);

    controller.set('model.publication.journal.id', 'test:journal_id');
    assert.equal(controller.get('journalIsInvalid'), false);

    controller.set('model.publication.journal.id', null);
    controller.set('model.publication.journal.journalName', 'Test journal name');
    assert.equal(controller.get('journalIsInvalid'), false);
  });

  test('check validateAndLoadTab rejects empty journal and title', function (assert) {
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let submission = EmberObject.create({ });
    let publication = EmberObject.create({
      journal: []
    });
    let model = {
      newSubmission: submission,
      publication
    };
    controller.set('model', model);
    assert.equal(controller.get('titleError'), false);
    assert.equal(controller.get('journalError'), false);
    assert.equal(controller.get('flaggedFields').indexOf('title'), -1);
    assert.equal(controller.get('flaggedFields').indexOf('journal'), -1);

    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.equal(controller.get('titleError'), true);
    assert.equal(controller.get('journalError'), true);
    assert.ok(controller.get('flaggedFields').indexOf('title') > -1);
    assert.ok(controller.get('flaggedFields').indexOf('journal') > -1);
  });

  test('check validateAndLoadTab rejects incomplete submitter', function (assert) {
    assert.expect(9);
    let controller = this.owner.lookup('controller:submissions/new/basics');
    let loadTabAccessed = false;
    let submission = EmberObject.create({
      isProxySubmission: true
    });
    let publication = EmberObject.create({
      title: 'Test publication title',
      journal: {
        id: 'journal:id'
      }
    });
    let model = {
      newSubmission: submission,
      publication
    };
    controller.set('model', model);
    controller.transitionToRoute = function () {
      assert.ok(true);
      loadTabAccessed = true;
    };

    // this will error if it proceeds to loadTab.
    assert.equal(controller.get('model.newSubmission.isProxySubmission'), true);
    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.equal(controller.get('submitterIsInvalid'), true);
    // no flagged fields in this instance and loadTab not accessed
    assert.equal(controller.get('titleError'), false);
    assert.equal(controller.get('journalError'), false);
    assert.equal(controller.get('submitterEmailError'), false);
    assert.equal(controller.get('flaggedFields').indexOf('journal'), -1);
    assert.equal(controller.get('flaggedFields').indexOf('title'), -1);
    assert.equal(controller.get('flaggedFields').indexOf('submitterEmail'), -1);
    assert.equal(loadTabAccessed, false);
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
      }
    });
    let publication = EmberObject.create({
      title: 'Test publication title',
      journal: {
        id: 'journal:id'
      },
      save() {
        assert.ok(true);
        return Promise.resolve();
      }
    });
    let model = {
      newSubmission: submission,
      publication
    };

    controller.set('model', model);
    controller.set('transitionToRoute', (route) => {
      // no errors and loadTab accessed
      assert.equal(controller.get('submitterIsInvalid'), false);
      assert.equal(controller.get('titleError'), false);
      assert.equal(controller.get('journalError'), false);
      assert.equal(controller.get('submitterEmailError'), false);
      assert.equal(controller.get('flaggedFields').indexOf('journal'), -1);
      assert.equal(controller.get('flaggedFields').indexOf('title'), -1);
      assert.equal(controller.get('flaggedFields').indexOf('submitterEmail'), -1);

      assert.ok(subSaved, 'submission was not saved');
    });

    assert.equal(controller.get('model.newSubmission.isProxySubmission'), true);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });

  /**
   * Mock the submission model object with a custom `#save()` function. This test makes
   * sure that the custom save function is called exactly once when the 'loadNext'
   * action is sent to the controller.
   */
  test('make sure submission is saved', function (assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:submissions/new/basics');
    const model = {
      publication: EmberObject.create({
        title: 'This is the moo-iest',
        journal: EmberObject.create({
          id: 'journal:id'
        }),
        save: () => Promise.resolve(assert.ok(true))
      }),
      newSubmission: EmberObject.create({
        save: () => Promise.resolve(assert.ok(true))
      })
    };

    controller.set('transitionToRoute', (route) => {});

    controller.set('model', model);
    controller.send('loadNext');
  });
});
