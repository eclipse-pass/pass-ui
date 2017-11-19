import { test } from 'qunit';
import moduleForAcceptance from 'pass-ember/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | dashboard');

// TODO Better way to handle server.shutdown?

test('visiting /dashboard', function(assert) {
  visit('/dashboard');

  andThen(function() {
    assert.equal(currentURL(), '/dashboard');
    server.shutdown()
  });
});

// TODO Test all redirection behavior
test('visiting /', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/login');
    server.shutdown()
  });
});

test('about link', function (assert) {
  visit('/dashboard');
  click('a:contains("About")');
  andThen(function() {
    assert.equal(currentURL(), '/about', 'should navigate to about');
    server.shutdown()
  });
});

test('contact link', function (assert) {
  visit('/dashboard');
  click('a:contains("Contact")');
  andThen(function() {
    assert.equal(currentURL(), '/contact', 'should navigate to contact');
    server.shutdown()
  });
});
