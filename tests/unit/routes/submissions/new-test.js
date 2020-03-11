import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | submissions/new', (hooks) => {
  setupTest(hooks);

  /*
   * Ended up mocking the Store in each test (instead of beforeEach()) in order to put
   * test assertions in store calls
   */
  hooks.beforeEach(function () {
    this.set('journal', EmberObject.create({ journalName: 'International Moonthly' }));
    this.set('publication', EmberObject.create({
      title: 'Test Publication',
      journal: this.get('journal')
    }));
    this.set('submission', EmberObject.create({
      submissionStatus: 'draft',
      publication: this.get('publication'),
      metadata: '{ "moo": "This is a moo" }'
    }));
  });

  test('fresh submission returned by model() when no ID is provided', async function (assert) {
    assert.expect(4);

    const route = this.owner.lookup('route:submissions/new');

    route.set('store', {
      createRecord(type, data) {
        switch (type) {
          case 'publication':
            assert.ok(true);
            return Promise.resolve(EmberObject.create({ title: 'MockMoo' }));
          case 'submission': // Submission - fall through to default
            assert.ok(true);
          // eslint-disable-next-line no-fallthrough
          default:
            return Promise.resolve(EmberObject.create(data));
        }
      },
      findRecord: (type, id) => Promise.resolve(EmberObject.create()),
      query: () => Promise.resolve(A())
    });

    const result = await route.model({});

    assert.ok(result, 'no model found');
    assert.notOk(result.newSubmission.get('publication'), 'There should be no publication on this submission');
  });

  /**
   * Test case: submission ID is included in URL, grant ID NOT included in URL
   *
   * Expect that createRecord and findRecord are each called once and that
   */
  test('The mock submission returned from model() when it\'s ID is included', async function (assert) {
    assert.expect(6);

    const mockSub = this.get('submission');

    const route = this.owner.lookup('route:submissions/new');

    route.set('store', {
      createRecord(type, data) {
        switch (type) {
          case 'publication':
            assert.ok(false, 'should not create a publication');
            return Promise.resolve(EmberObject.create({ title: 'MockMoo' }));
          default:
            assert.ok(false, `unexpected 'createRecord' type found: ${type}`);
            return Promise.resolve(EmberObject.create(data));
        }
      },
      findRecord(type, id) {
        switch (type) {
          case 'submission':
            assert.ok(true);
            return Promise.resolve(mockSub);
          default:
            assert.ok(false, `unexpected 'createRecord' type found: ${type}`);
            return Promise.resolve(EmberObject.create());
        }
      },
      query: () => Promise.resolve(A())
    });
    route.set('workflow', {
      setDoiInfo(data) {
        assert.ok(data);
        assert.equal(data.moo, 'This is a moo');
      }
    });

    const result = await route.model({ submission: 'moo' });

    assert.ok(result, 'no model found');
    assert.ok(result.newSubmission.get('publication'), 'There should be a publication on this submission');
    assert.equal(result.newSubmission.get('publication.title'), 'Test Publication');
  });
});
