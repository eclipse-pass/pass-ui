import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

// module('Acceptance | service | autocomplete', (hooks) => {
//   setupApplicationTest(hooks);
//   setupMirage(hooks);

//   test('autocomplete for journal with \'aa\' should return good results', (assert) => {

//   });
// });
module('service:autocomplete', 'Unit | Service | autocomplete', (hooks) => {
  setupTest(hooks);

  test('it exists', (assert) => {
    assert.ok(this.owner.lookup('service:autocomplete'));
  });
});
