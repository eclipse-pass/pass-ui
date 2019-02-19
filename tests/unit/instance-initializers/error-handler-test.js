import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'pass-ember/instance-initializers/error-handler';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import { setupTest } from 'ember-qunit';

module('Unit | Instance Initializers | error handler', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    run(() => {
      this.application = Application.create({ autoboot: false });
      this.appInstance = this.application.buildInstance();
    });
  });

  hooks.afterEach(function () {
    run(this.appInstance, 'destroy');
    destroyApp(this.application);
  });

  // Replace this with your real tests.
  test('it works', function (assert) {
    initialize(this.appInstance);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });
});
