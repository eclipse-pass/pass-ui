import { test } from 'qunit';
import moduleForAcceptance from 'pass-ember/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | login');

test('visiting /login', (assert) => {
  visit('/login');

  andThen(() => {
    assert.equal(currentURL(), '/login');
  });
});
