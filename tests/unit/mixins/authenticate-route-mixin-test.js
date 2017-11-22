import EmberObject from '@ember/object';
import AuthenticateRouteMixinMixin from 'pass-ember/mixins/authenticate-route-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | authenticate route mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let AuthenticateRouteMixinObject = EmberObject.extend(AuthenticateRouteMixinMixin);
  let subject = AuthenticateRouteMixinObject.create();
  assert.ok(subject);
});
