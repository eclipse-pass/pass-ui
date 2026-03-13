import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type NewRoute from 'pass-ui/routes/submissions/new';
import type Workflow from 'pass-ui/services/workflow';

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
      journal: this['journal'],
    });
    this.set('submission', {
      submissionStatus: 'draft',
      publication: this['publication'],
      metadata: '{ "moo": "This is a moo" }',
    });
  });

  test('fresh submission returned by model() when no ID is provided', async function (assert) {
    assert.expect(4);

    const route = this.owner.lookup('route:submissions/new') as NewRoute;

    route.store = {
      createRecord(type: string, data: Record<string, unknown>) {
        switch (type) {
          case 'publication':
            assert.ok(true);
            return { title: 'MockMoo' };
          case 'submission': // Submission - fall through to default
            assert.ok(true);
          // eslint-disable-next-line no-fallthrough
          default:
            return { ...data };
        }
      },
      request: (() => Promise.resolve({ content: { data: [] } })) as unknown as typeof route.store.request,
    } as unknown as typeof route.store;

    const result = await route.model({});

    assert.ok(result, 'no model found');
    assert.notOk(result.newSubmission!.publication, 'There should be no publication on this submission');
  });

  /**
   * Test case: submission ID is included in URL, grant ID NOT included in URL
   *
   * Expect that createRecord and findRecord are each called once and that
   */
  test("The mock submission returned from model() when it's ID is included", async function (assert) {
    assert.expect(5);

    const mockSub = this['submission'];

    const route = this.owner.lookup('route:submissions/new') as NewRoute;

    let findRecordCalled = false;

    route.store = {
      createRecord(type: string, data: Record<string, unknown>) {
        switch (type) {
          case 'publication':
            assert.ok(false, 'should not create a publication');
            return { title: 'MockMoo' };
          default:
            assert.ok(false, `unexpected 'createRecord' type found: ${type}`);
            return { ...data };
        }
      },
      request: ((req: { op: string }) => {
        if (req.op === 'findRecord') {
          findRecordCalled = true;
          return Promise.resolve({ content: { data: mockSub } });
        }
        // loadObjects or file/submission-event queries
        return Promise.resolve({ content: { data: [] } });
      }) as unknown as typeof route.store.request,
    } as unknown as typeof route.store;

    route.workflow = {
      setFiles(files: unknown) {
        assert.ok(files);
      },
    } as unknown as Workflow;

    const result = await route.model({ submission: 'moo' });

    assert.ok(findRecordCalled, 'findRecord should have been called for the submission');
    assert.ok(result, 'no model found');
    assert.ok(result.newSubmission!.publication, 'There should be a publication on this submission');
    assert.strictEqual(result.newSubmission!.publication?.title, 'Test Publication');
  });
});
