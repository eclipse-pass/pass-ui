import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import stripEmptyArrays from 'pass-ui/util/strip-empty-arrays';

module('Integration | Component | metadata-form', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const schema = {
      elements: [
        {
          name: 'title',
          type: 'text',
          title: 'Title',
          isRequired: true,
        },
      ],
    };

    const data = {
      title: 'this is a title',
    };

    this.set('schema', schema);
    this.set('data', data);
  });

  test('it renders', async function (assert) {
    await render(hbs`<MetadataForm @schema={{this.schema}} />`);

    assert.dom('#metadata-form').exists();
  });

  test('Test "stripEmptyArrays"', function (assert) {
    const obj = {
      one: [],
      two: ['moo'],
      three: undefined,
      four: [''],
      five: [{}],
      six: {},
      seven: { moo: [] },
    };
    const result = stripEmptyArrays(obj);

    assert.notOk('one' in result);
    assert.ok('two' in result);
    assert.ok('three' in result);
    assert.ok('four' in result);
    assert.ok('five' in result);
    assert.ok('six' in result);
    assert.ok('seven' in result);
    assert.ok('moo' in result.seven);
  });
});
