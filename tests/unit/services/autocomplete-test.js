import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | autocomplete', (hooks) => {
  setupTest(hooks);

  test('it exists and queries', function (assert) {
    const TYPE = 'myType';
    const FIELD = 'myField';
    const INPUT = 'text';

    class StoreStub extends Service {
      query(type, query) {
        assert.equal(type, TYPE);
        assert.ok(query);
        assert.ok('Query object should include the field name somewhere', query.filter[type].includes(FIELD));
        assert.ok('Query object should include the input value', query.filter[type].includes(INPUT));
        return Promise.resolve();
      }
    }

    const service = this.owner.lookup('service:autocomplete');
    service.set('store', new StoreStub());
    service.suggest(TYPE, FIELD, INPUT).then((res) => {
      assert.ok('Suggest service resolves');
    });
  });

  test('suggestion query appended to existing context', function (assert) {
    const TYPE = 'myType';
    const FIELD = 'myField';
    const INPUT = 'text';
    const CONTEXT = { filter: { [TYPE]: 'queryFragment' } };

    class StoreStub extends Service {
      query(type, query) {
        assert.equal(type, TYPE);
        const filter = query.filter[type];
        assert.ok(filter);
        assert.ok(filter.startsWith('queryFragment'));
        assert.ok(filter.includes(FIELD));
        assert.ok(filter.includes(INPUT));
        return Promise.resolve();
      }
    }

    const service = this.owner.lookup('service:autocomplete');
    service.set('store', new StoreStub());

    service.suggest(TYPE, FIELD, INPUT, CONTEXT).then(() => {
      assert.ok('Resolves fine');
    });
  });

  test('Suggestion query with two fields', function (assert) {
    const TYPE = 'myType';
    const FIELDS = ['myField1', 'myField2'];
    const INPUT = 'text';

    class StoreStub extends Service {
      query(type, query) {
        assert.equal(type, TYPE);

        const filter = query.filter[type];
        assert.ok(filter);
        assert.ok(filter.includes(FIELDS[0]));
        assert.ok(filter.includes(FIELDS[1]));
        assert.ok(filter.includes(INPUT));

        return Promise.resolve();
      }
    }

    const service = this.owner.lookup('service:autocomplete');
    service.set('store', new StoreStub());

    service.suggest(TYPE, FIELDS, INPUT).then(() => {
      assert.ok('Suggest function resolves');
    });
  });
});
