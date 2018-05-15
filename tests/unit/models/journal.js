import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | journal', (hooks) => {
  setupTest(hooks);

  // Specify the other units that are required for this test.
  test('it exists', function (assert) {
    const journal = run(() => this.owner.lookup('service:store').createRecord('journal'));
    assert.ok(!!journal);

    // wrap asynchronous call in run loop
    // run(() => player.levelUp());

    // assert.equal(player.get('level'), 5, 'level gets incremented');
    // assert.equal(player.get('levelName'), 'Professional', 'new level is called professional');
  });
});
