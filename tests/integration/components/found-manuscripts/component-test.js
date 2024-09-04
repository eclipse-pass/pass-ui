/* eslint-disable ember/no-classic-classes */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { set } from '@ember/object';

module('Integration | Component | found-manuscripts', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register(
      'service:app-static-config',
      Service.extend({
        getStaticConfig: () =>
          Promise.resolve({
            branding: {
              stylesheet: '',
              pages: {
                contactUrl: '',
              },
            },
          }),
        addCss: () => {},
      }),
    );

    this.owner.register(
      'service:workflow',
      Service.extend({
        getDoiInfo: () => ({ DOI: 'doi-moo' }),
      }),
    );

    // Dumb service mock to prevent random fetches
    this.owner.register(
      'service:oa-manuscript-service',
      Service.extend({
        lookup: () => Promise.resolve([]),
      }),
    );
  });

  test('An OA MS is displayed', async function (assert) {
    // Mock the download service
    const mockMsService = Service.extend({
      lookup(doi) {
        assert.ok(doi, 'DOI needs to be present');
        return Promise.resolve([
          {
            name: 'This is a moo',
            url: 'http://moo.example.com',
          },
        ]);
      },
    });

    this.owner.register('service:oa-manuscript-service', mockMsService);

    await render(hbs`<FoundManuscripts />`);

    assert.ok(this.element.textContent.includes('http://moo.example.com'));
  });

  test('Nothing renders when disabled', async function (assert) {
    set(this, 'disabled', true);
    await render(hbs`<FoundManuscripts @disabled={{this.disabled}} />`);
    assert.strictEqual(this.element.childElementCount, 1);
  });

  test('Message should appear if NOT disabled AND no files found', async function (assert) {
    const expected =
      'We could not find any existing open access copies for your manuscript/article. Please upload your own copy.';

    this.owner.register(
      'service:oa-manuscript-service',
      Service.extend({
        lookup(doi) {
          assert.ok(doi, 'DOI still needs to be present');
          return Promise.resolve([]);
        },
      }),
    );

    await render(hbs`<FoundManuscripts />`);
    assert.ok(this.element.textContent.includes(expected));
  });
});
