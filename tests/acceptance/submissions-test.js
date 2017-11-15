import { test } from 'qunit';
import moduleForAcceptance from 'pass-ember/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | submissions');

test('visiting /submissions', function(assert) {
  visit('/submissions');

  andThen(function() {
    assert.equal(currentURL(), '/submissions');
    server.shutdown()
  });
});
