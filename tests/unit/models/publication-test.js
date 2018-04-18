import { moduleForModel, test } from 'ember-qunit';

moduleForModel('publication', 'Unit | Model | publication', {
  // Specify the other units that are required for this test.
  needs: ['model:journal', 'model:submission']
});

test('it exists', function (assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
