import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Route | submissions/index', (hooks) => {
  setupTest(hooks);

  test('Make sure ignore list is included in ES query for a submitter', async function (assert) {
    assert.expect(2);
    const route = this.owner.lookup('route:submissions/index');

    route.set('currentUser', Ember.Object.create({
      user: Ember.Object.create({
        id: 'Moo',
        isSubmitter: true
      })
    }));
    route.set('searchHelper', Ember.Object.create({
      getIgnoreList: () => ['ID-3'],
      clearIgnore: () => {}
    }));
    route.set('store', Ember.Object.create({
      query: (type, query) => {
        const filter = query.query.bool.must_not;
        assert.equal(filter.length, 2, 'Should be two "must_not" terms');
        assert.deepEqual(filter[1].terms, { '@id': ['ID-3'] });

        return Promise.resolve(Ember.A());
      }
    }));

    await route.model();
  });

  test('Make sure ignore list is included in ES query for a admin', async function (assert) {
    assert.expect(2);
    const route = this.owner.lookup('route:submissions/index');

    route.set('currentUser', Ember.Object.create({
      user: Ember.Object.create({
        id: 'Moo',
        isAdmin: true
      })
    }));
    route.set('searchHelper', Ember.Object.create({
      getIgnoreList: () => ['ID-3'],
      clearIgnore: () => {}
    }));
    route.set('store', Ember.Object.create({
      query: (type, query) => {
        const filter = query.query.must_not;
        assert.equal(filter.length, 2, 'Should be two "must_not" terms');
        assert.deepEqual(filter[1].terms, { '@id': ['ID-3'] });

        return Promise.resolve(Ember.A());
      }
    }));

    await route.model();
  });
});
