/* eslint-disable ember/no-classic-classes */
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions repoid cell', (hooks) => {
  setupRenderingTest(hooks);

  // Inject mocked store that on query returns a single user
  hooks.beforeEach(function () {
    let store = Service.extend({
      query: (type, q) =>
        Promise.resolve([
          EmberObject.create({
            id: 'test',
            accessUrl: 'https://dspace.example.com/handle/12345/67890',
            externalIds: ['https://dspace.example.com/handle/12345/67890'],
          }),
          EmberObject.create({
            id: 'test2',
            accessUrl: 'https://dspace.example.com/items/abcde-12345',
            externalIds: ['https://dspace.example.com/items/abcde-12345'],
          }),
        ]),
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', store);
      this.store = this.owner.lookup('service:store');
    });
  });

  test('it renders', async function (assert) {
    const record = EmberObject.create({
      publication: EmberObject.create({ id: '1' }),
    });

    this.record = record;

    await render(hbs`<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<SubmissionsRepoidCell @record={{this.record}} />`);

    assert.ok(true);
  });

  /**
   * Make sure the component renders when `record.publication.id` returns no value
   */
  test('it renders with when data is missing', async function (assert) {
    assert.expect(1);

    this.set(
      'store',
      Service.extend({
        query(type, q) {
          assert.ok(true);
        },
      }),
    );
    const record = EmberObject.create({
      publication: EmberObject.create({}),
    });
    this.record = record;

    await render(hbs`<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<SubmissionsRepoidCell @record={{this.record}} />`);
    assert.ok(true);
  });

  /**
   * Make sure the DSpace ids with handles and items are formatted correctly
   */
  test('DSpace ids are formatted correctly', async function (assert) {
    assert.expect(4);

    const record = EmberObject.create({
      publication: EmberObject.create({ id: '2' }),
    });
    this.record = record;

    await render(hbs`<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<th class='table-header' />
<SubmissionsRepoidCell @record={{this.record}} />`);

    assert.ok(true);
    console.log(this.element);

    const lis = this.element.querySelectorAll('li');
    assert.strictEqual(lis.length, 2);
    assert.strictEqual(lis[0].textContent.trim(), '12345/67890');
    assert.strictEqual(lis[1].textContent.trim(), 'abcde-12345');
  });
});
