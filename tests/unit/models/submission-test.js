import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | submission', (hooks) => {
  setupTest(hooks);

  test('submitterEmailDisplay should remove mailto from submitterEmail', function (assert) {
    const submission = run(() =>
      this.owner.lookup('service:store').createRecord('submission', {
        submitterEmail: 'mailto:test@test.com',
      })
    );

    assert.strictEqual(submission.get('submitterEmailDisplay'), 'test@test.com');
  });

  test('isProxySubmission is correctly calculated', function (assert) {
    const submission = run(() => this.owner.lookup('service:store').createRecord('submission'));
    // it isn't any kind of submission yet, let alone a proxy submission!
    assert.false(submission.get('isProxySubmission'));

    const user = this.owner.lookup('service:store').createRecord('user', {
      id: 'test:user',
    });

    // there is a submitter, but no preparer, still not a proxy submission
    assert.false(submission.get('isProxySubmission'));

    submission.set('submitterName', 'Test Name');
    submission.set('submitterEmail', 'mailto:test@test.com');
    // a submitterEmail and submitterName has been entered, this is going to be a proxy submission.
    assert.true(submission.get('isProxySubmission'));

    submission.set('submitterName', null);
    submission.set('submitterEmail', null);
    submission.set('preparers', [user]);
    // if there is one preparer, regardless of other values, it is a proxy submission
    assert.true(submission.get('isProxySubmission'));
  });
});
