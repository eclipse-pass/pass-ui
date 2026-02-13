/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | submissions/new', (hooks) => {
  setupTest(hooks);

  /*
   * Ended up mocking the Store in each test (instead of beforeEach()) in order to put
   * test assertions in store calls
   */
  hooks.beforeEach(function () {
    this.set('journal', { journalName: 'International Moonthly' });
    this.set('publication', {
      title: 'Test Publication',
      journal: (this as any)['journal'],
    });
    this.set('submission', {
      submissionStatus: 'draft',
      publication: (this as any)['publication'],
      metadata: '{ "moo": "This is a moo" }',
    });
  });

  test('fresh submission returned by model() when no ID is provided', async function (assert) {
    assert.expect(4);

    const route: any = this.owner.lookup('route:submissions/new');

    route.store = {
      createRecord(type: any, data: any) {
        switch (type) {
          case 'publication':
            assert.ok(true);
            return Promise.resolve({ title: 'MockMoo' });
          case 'submission': // Submission - fall through to default
            assert.ok(true);
          // eslint-disable-next-line no-fallthrough
          default:
            return Promise.resolve({ ...data });
        }
      },
      findRecord: (type: any, id: any) => Promise.resolve({}),
      query: () => Promise.resolve([]),
    };

    const result = await route.model({});

    assert.ok(result, 'no model found');
    assert.notOk(result.newSubmission.publication, 'There should be no publication on this submission');
  });

  /**
   * Test case: submission ID is included in URL, grant ID NOT included in URL
   *
   * Expect that createRecord and findRecord are each called once and that
   */
  test("The mock submission returned from model() when it's ID is included", async function (assert) {
    assert.expect(5);

    const mockSub = (this as any)['submission'];

    const route: any = this.owner.lookup('route:submissions/new');

    route.store = {
      createRecord(type: any, data: any) {
        switch (type) {
          case 'publication':
            assert.ok(false, 'should not create a publication');
            return Promise.resolve({ title: 'MockMoo' });
          default:
            assert.ok(false, `unexpected 'createRecord' type found: ${type}`);
            return Promise.resolve({ ...data });
        }
      },
      findRecord(type: any, id: any) {
        switch (type) {
          case 'submission':
            assert.ok(true);
            return Promise.resolve(mockSub);
          default:
            assert.ok(false, `unexpected 'createRecord' type found: ${type}`);
            return Promise.resolve({});
        }
      },
      query: () => Promise.resolve([]),
    };

    route.workflow = {
      setFiles(files: any) {
        assert.ok(files);
      },
    };

    const result = await route.model({ submission: 'moo' });

    assert.ok(result, 'no model found');
    assert.ok(result.newSubmission.publication, 'There should be a publication on this submission');
    assert.strictEqual(result.newSubmission.publication?.title, 'Test Publication');
  });
});
