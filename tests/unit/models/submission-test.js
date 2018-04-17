import { moduleForModel, test } from 'ember-qunit';

moduleForModel('submission', 'Unit | Model | submission', {
  // Specify the other units that are required for this test.
  needs: ['model:journal', 'model:deposit', 'model:user', 'model:person', 'model:grant']
});

test('it exists', function (assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
