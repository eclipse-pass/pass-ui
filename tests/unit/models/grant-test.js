import { moduleForModel, test } from 'ember-qunit';

moduleForModel('grant', 'Unit | Model | grant', {
  // Specify the other units that are required for this test.
  needs: ['model:funder', 'model:user', 'model:submission', 'model:contributor']
});

test('it exists', function (assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
