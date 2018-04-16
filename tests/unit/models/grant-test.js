import { moduleForModel, test } from 'ember-qunit';

moduleForModel('grant', 'Unit | Model | grant', {
  // Specify the other units that are required for this test.
  needs: ['model:funder', 'model:user', 'model:person', 'model:submission']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
