import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type SubmissionsNewBasics from 'pass-ui/controllers/submissions/new/basics';
import type AppStore from 'pass-ui/services/store';
import type UserModel from 'pass-ui/models/user';

interface BasicsSubmissionFixture {
  isProxySubmission?: boolean;
  submitterEmailDisplay?: string | null;
  submitterName?: string | null;
  submitterEmail?: string | null;
  submitter?: UserModel;
  repositories: unknown[];
  grants: unknown[];
}

interface BasicsPublicationFixture {
  title?: string;
  journal: {
    id?: string;
    get?: (key: string) => string | null | undefined;
  };
}

module('Unit | Controller | submissions/new/basics', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    assert.ok(controller);
  });

  test('ensure email format validation works', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    const submission: BasicsSubmissionFixture = {
      submitterEmailDisplay: 'badtestemail',
      repositories: [],
      grants: [],
    };
    const model = {
      newSubmission: submission,
      publication: { journal: {} },
      submissionEvents: [],
      journal: null,
    };
    controller.model = model as unknown as typeof controller.model;
    assert.true(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'bademail.com';
    assert.true(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'bad|#$~email.com';
    assert.true(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'mailto:bad@email.com';
    assert.true(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'bad@email+com';
    assert.true(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'good@email.com';
    assert.false(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'good.email@email.co.uk';
    assert.false(controller.submitterEmailIsInvalid);

    submission.submitterEmailDisplay = 'good_email55@ema-il.co.uk';
    assert.false(controller.submitterEmailIsInvalid);
  });

  test('check submitter validation', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    const submission: BasicsSubmissionFixture = {
      repositories: [],
      grants: [],
    };
    const submitter = {
      id: 'https://fake.id',
    } as unknown as UserModel;
    const model = {
      newSubmission: submission,
      publication: { journal: {} },
      submissionEvents: [],
      journal: null,
    };
    controller.model = model as unknown as typeof controller.model;
    assert.true(controller.submitterEmailIsInvalid);
    assert.true(controller.submitterIsInvalid);

    submission.submitterName = 'Test Name';
    submission.submitterEmail = 'mailto:good@email.com';
    assert.false(controller.submitterIsInvalid);

    submission.submitterName = null;
    submission.submitterEmailDisplay = null;
    submission.submitter = submitter;
    assert.false(controller.submitterIsInvalid);
  });

  test('check title and journal validation', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    const submission = {
      repositories: [],
      grants: [],
    };
    const journalData: Record<string, string | null> = {};
    const journal = {
      get(key: string) {
        return journalData[key];
      },
    };
    const publication: BasicsPublicationFixture = {
      journal,
    };
    const model = {
      newSubmission: submission,
      publication,
      submissionEvents: [],
      journal: null,
    };
    controller.model = model as unknown as typeof controller.model;
    assert.true(controller.journalIsInvalid);
    assert.true(controller.titleIsInvalid);

    publication.title = 'Test title';
    assert.false(controller.titleIsInvalid);

    journalData.id = 'test:journal_id';
    assert.false(controller.journalIsInvalid);

    journalData.id = null;
    journalData.journalName = 'Test journal name';
    assert.false(controller.journalIsInvalid);
  });

  test('check validateAndLoadTab rejects empty publication title but not journal title', function (assert) {
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    const submission = {
      repositories: [],
      grants: [],
    };
    const publication: BasicsPublicationFixture = {
      journal: {},
    };
    const model = {
      newSubmission: submission,
      publication,
      submissionEvents: [],
      journal: null,
    };
    controller.model = model as unknown as typeof controller.model;
    assert.false(controller.titleError);
    assert.false(controller.journalError);
    assert.strictEqual(controller.flaggedFields.indexOf('title'), -1);
    assert.strictEqual(controller.flaggedFields.indexOf('journal'), -1);

    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.true(controller.titleError);
    assert.false(controller.journalError);
    assert.ok(controller.flaggedFields.indexOf('title') > -1);
    assert.strictEqual(controller.flaggedFields.indexOf('journal'), -1);
  });

  test('check validateAndLoadTab rejects incomplete submitter', function (assert) {
    assert.expect(9);
    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    let loadTabAccessed = false;
    const submission = {
      isProxySubmission: true,
    };
    const publication = {
      title: 'Test publication title',
      journal: {
        id: 'journal:id',
      },
    };
    const model = {
      newSubmission: submission,
      publication,
      submissionEvents: [],
      journal: null,
    };
    controller.model = model as unknown as typeof controller.model;
    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (() => {
      assert.ok(true);
      loadTabAccessed = true;
    }) as typeof routerService.transitionTo;

    // this will error if it proceeds to loadTab.
    assert.true(controller.model.newSubmission.isProxySubmission);
    controller.send('validateAndLoadTab', 'submissions.new.basics');

    assert.true(controller.submitterIsInvalid);
    // no flagged fields in this instance and loadTab not accessed
    assert.false(controller.titleError);
    assert.false(controller.journalError);
    assert.false(controller.submitterEmailError);
    assert.strictEqual(controller.flaggedFields.indexOf('journal'), -1);
    assert.strictEqual(controller.flaggedFields.indexOf('title'), -1);
    assert.strictEqual(controller.flaggedFields.indexOf('submitterEmail'), -1);
    assert.false(loadTabAccessed);
  });

  test('check validateAndLoadTab accepts complete information', function (assert) {
    assert.expect(11);

    let subSaved = false;

    const controller = this.owner.lookup('controller:submissions/new/basics') as SubmissionsNewBasics;
    const submission = {
      isProxySubmission: true,
      submitterName: 'Test Submitter',
      submitterEmail: 'mailto:test@email.com',
      submitterEmailDisplay: 'test@email.com',
    };
    const publication = {
      title: 'Test publication title',
      journal: {
        id: 'journal:id',
      },
    };
    const model = {
      newSubmission: submission,
      publication,
      submissionEvents: [],
      journal: null,
    };

    controller.model = model as unknown as typeof controller.model;

    const store = this.owner.lookup('service:store') as AppStore;
    store.persistRecord = ((record: unknown) => {
      assert.ok(true);
      if (record === submission) {
        subSaved = true;
      }
      return Promise.resolve({ content: {} }) as ReturnType<typeof store.persistRecord>;
    }) as typeof store.persistRecord;

    const routerService = this.owner.lookup('service:router');
    routerService.transitionTo = (() => {
      // no errors and loadTab accessed
      assert.false(controller.submitterIsInvalid);
      assert.false(controller.titleError);
      assert.false(controller.journalError);
      assert.false(controller.submitterEmailError);
      assert.strictEqual(controller.flaggedFields.indexOf('journal'), -1);
      assert.strictEqual(controller.flaggedFields.indexOf('title'), -1);
      assert.strictEqual(controller.flaggedFields.indexOf('submitterEmail'), -1);

      assert.ok(subSaved, 'submission was not saved');
    }) as typeof routerService.transitionTo;

    assert.true(controller.model.newSubmission.isProxySubmission);
    controller.send('validateAndLoadTab', 'submissions.new.basics');
  });
});
