import EmberObject from '@ember/object';
import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

/**
 * This ends up mostly checking the query generation util
 */
module('Unit | Route | submissions/index', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.route = this.owner.lookup('route:submissions/index');
    const user = EmberObject.create({
      id: 0,
      isSubmitter: true,
      isAdmin: false,
    });

    this.route.currentUser = EmberObject.create({ user });
  });

  test('No params on route still includes pagination in query', async function (assert) {
    this.route.store = {
      query: (model, query) => {
        assert.equal(model, 'submission', 'Query is requesting "submission" model');
        assert.ok(query.filter.submission, 'Query has a filter[submission] part');
        assert.ok(query.filter.submission.includes(`submitter.id==0`), 'Filter includes non-admin user selection');
        assert.ok(query.page, 'Query has pagination object');
        assert.deepEqual(
          query.page,
          { number: 1, size: 10, totals: true },
          'Pagination in query should have default values',
        );
        return Promise.resolve({});
      },
    };

    await this.route.model({});
  });

  test('Make sure input params are passed to store query', async function (assert) {
    this.route.store = {
      query: (model, query) => {
        assert.equal(model, 'submission', 'Query is requesting "submission" model');
        assert.ok(query.page, 'Query has pagination object');
        assert.deepEqual(
          query.page,
          { number: 2, size: 5, totals: true },
          'Pagination in query should match input params',
        );
        assert.ok(
          query.filter.submission.includes('=ini="*Hello moo!*"'),
          'Query filter should include input param filter string',
        );
        return Promise.resolve({});
      },
    };

    await this.route.model({
      page: 2,
      pageSize: 5,
      filter: 'Hello moo!',
    });
  });

  test("Single word input filter isn't surrounded by double quotes", async function (assert) {
    this.route.store = {
      query: (model, query) => {
        assert.ok(query.filter.submission.includes('=ini=*Moo*'));
        return Promise.resolve({});
      },
    };

    await this.route.model({ filter: 'Moo' });
  });

  test("Admin user doesn't get restricted results", async function (assert) {
    this.route.currentUser = {
      user: { id: 0, isAdmin: true, isSubmitter: true },
    };
    this.route.store = {
      query: (model, query) => {
        assert.notOk(
          query.filter.submission.includes(`submitter.id==0`),
          'Filter does not include non-admin user selection',
        );
        return Promise.resolve({});
      },
    };

    await this.route.model({});
  });
});
