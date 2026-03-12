import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

/**
 * This ends up mostly checking the query generation util
 */
module('Unit | Route | submissions/index', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this['route'] = this.owner.lookup('route:submissions/index');
    const user = {
      id: 0,
      isSubmitter: true,
      isAdmin: false,
    };

    this['route'].currentUser = { user };
  });

  test('No params on route still includes pagination in query', async function (assert) {
    this['route'].store = {
      request: (req: { url: string }) => {
        const url = decodeURIComponent(req.url);
        assert.true(url.includes('/data/submission'), 'Query is requesting "submission" model');
        assert.true(url.includes('filter[submission]'), 'Query has a filter[submission] part');
        assert.true(url.includes('submitter.id==0'), 'Filter includes non-admin user selection');
        assert.true(url.includes('page[number]=1'), 'Query has default page number');
        assert.true(url.includes('page[size]=10'), 'Query has default page size');
        assert.true(url.includes('page[totals]=true'), 'Query has page totals');
        return Promise.resolve({ content: { data: {} } });
      },
    };

    await this['route'].model({});
  });

  test('Make sure input params are passed to store query', async function (assert) {
    this['route'].store = {
      request: (req: { url: string }) => {
        const url = decodeURIComponent(req.url);
        assert.true(url.includes('/data/submission'), 'Query is requesting "submission" model');
        assert.true(url.includes('page[number]=2'), 'Page number matches input');
        assert.true(url.includes('page[size]=5'), 'Page size matches input');
        assert.true(url.includes('=ini="*Hello moo!*"'), 'Query filter should include input param filter string');
        return Promise.resolve({ content: { data: {} } });
      },
    };

    await this['route'].model({
      page: 2,
      pageSize: 5,
      filter: 'Hello moo!',
    });
  });

  test("Single word input filter isn't surrounded by double quotes", async function (assert) {
    this['route'].store = {
      request: (req: { url: string }) => {
        const url = decodeURIComponent(req.url);
        assert.true(url.includes('=ini=*Moo*'));
        return Promise.resolve({ content: { data: {} } });
      },
    };

    await this['route'].model({ filter: 'Moo' });
  });

  test("Admin user doesn't get restricted results", async function (assert) {
    this['route'].currentUser = {
      user: { id: 0, isAdmin: true, isSubmitter: true },
    };
    this['route'].store = {
      request: (req: { url: string }) => {
        const url = decodeURIComponent(req.url);
        assert.false(url.includes('submitter.id==0'), 'Filter does not include non-admin user selection');
        return Promise.resolve({ content: { data: {} } });
      },
    };

    await this['route'].model({});
  });
});
