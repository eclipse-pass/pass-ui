import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | submission', (hooks) => {
  setupTest(hooks);

  test('submitterEmailDisplay should remove mailto from submitterEmail', function (assert) {
    const submission = run(() => this.owner.lookup('service:store').createRecord('submission', {
      submitterEmail: 'mailto:test@test.com'
    }));

    assert.equal(submission.get('submitterEmailDisplay'), 'test@test.com');
  });

  test('isProxySubmission is correctly calculated', function (assert) {
    const submission = run(() => this.owner.lookup('service:store').createRecord('submission'));
    // it isn't any kind of submission yet, let alone a proxy submission!
    assert.equal(submission.get('isProxySubmission'), false);

    const user = run(() => this.owner.lookup('service:store').createRecord('user', {
      id: 'test:user',
      submitter: user
    }));

    // there is a submitter, but no preparer, still not a proxy submission
    assert.equal(submission.get('isProxySubmission'), false);

    run(() => submission.set('submitterName', 'Test Name'));
    run(() => submission.set('submitterEmail', 'mailto:test@test.com'));
    // a submitterEmail and submitterName has been entered, this is going to be a proxy submission.
    assert.equal(submission.get('isProxySubmission'), true);

    run(() => submission.set('submitterName', null));
    run(() => submission.set('submitterEmail', null));
    run(() => submission.set('preparers', A([user])));
    // if there is one preparer, regardless of other values, it is a proxy submission
    assert.equal(submission.get('isProxySubmission'), true);
  });
});
