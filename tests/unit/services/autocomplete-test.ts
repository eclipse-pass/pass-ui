import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import type AutocompleteService from 'pass-ui/services/autocomplete';

module('Unit | Service | autocomplete', (hooks) => {
  setupTest(hooks);

  test('it exists and queries', function (assert) {
    const TYPE = 'my-type';
    const FIELD = 'myField';
    const INPUT = 'text';

    class StoreStub extends Service {
      request(req: { url: string }) {
        const url = req.url as string;
        assert.true(url.includes('/data/myType'), 'URL includes camelCase path');
        assert.true(url.includes('filter'), 'URL includes filter param');
        assert.true(url.includes(FIELD), 'URL includes field name');
        assert.true(url.includes(INPUT), 'URL includes input value');
        return Promise.resolve({ content: { data: [] } });
      }
    }

    const service = this.owner.lookup('service:autocomplete') as AutocompleteService;
    service.store = new StoreStub() as unknown as typeof service.store;
    service.suggest(TYPE, FIELD, INPUT).then(() => {
      assert.ok('Suggest service resolves');
    });
  });

  test('suggestion query appended to existing context', function (assert) {
    const TYPE = 'my-type';
    const FIELD = 'myField';
    const INPUT = 'text';
    const CONTEXT = { filter: { [TYPE]: 'queryFragment' } };

    class StoreStub extends Service {
      request(req: { url: string }) {
        const url = decodeURIComponent(req.url as string);
        assert.true(url.includes('/data/myType'), 'URL includes camelCase path');
        assert.true(url.includes('queryFragment'), 'URL includes existing context filter');
        assert.true(url.includes(FIELD), 'URL includes field name');
        assert.true(url.includes(INPUT), 'URL includes input value');
        return Promise.resolve({ content: { data: [] } });
      }
    }

    const service = this.owner.lookup('service:autocomplete') as AutocompleteService;
    service.store = new StoreStub() as unknown as typeof service.store;

    service.suggest(TYPE, FIELD, INPUT, CONTEXT).then(() => {
      assert.ok('Resolves fine');
    });
  });

  test('Suggestion query with two fields', function (assert) {
    const TYPE = 'my-type';
    const FIELDS = ['myField1', 'myField2'];
    const INPUT = 'text';

    class StoreStub extends Service {
      request(req: { url: string }) {
        const url = decodeURIComponent(req.url as string);
        assert.true(url.includes('/data/myType'), 'URL includes camelCase path');
        assert.true(url.includes(FIELDS[0]!), 'URL includes first field');
        assert.true(url.includes(FIELDS[1]!), 'URL includes second field');
        assert.true(url.includes(INPUT), 'URL includes input value');

        return Promise.resolve({ content: { data: [] } });
      }
    }

    const service = this.owner.lookup('service:autocomplete') as AutocompleteService;
    service.store = new StoreStub() as unknown as typeof service.store;

    service.suggest(TYPE, FIELDS, INPUT).then(() => {
      assert.ok('Suggest function resolves');
    });
  });
});
