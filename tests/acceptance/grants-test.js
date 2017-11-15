import { test } from 'qunit';
import moduleForAcceptance from 'pass-ember/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | grants');

test('visiting /grants', function(assert) {
  visit('/grants');

  andThen(function() {
    assert.equal(currentURL(), '/grants');
    server.shutdown()
  });
});
