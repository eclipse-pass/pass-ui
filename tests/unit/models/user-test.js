import { moduleForModel, test } from 'ember-qunit';

moduleForModel('user', 'Unit | Model | user', {
  // Specify the other units that are required for this test.
  needs: ['model:submission']
});

test('it exists', function (assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
  assert.equal(model.get('isAdmin'), false);
  assert.equal(model.get('isSubmitter'), false);

  model.set('roles', ['admin']);
  assert.equal(model.get('isAdmin'), true);

  model.get('roles').push('submitter');
  assert.equal(model.get('isSubmitter'), true);
  assert.equal(model.get('isAdmin'), true);
});
