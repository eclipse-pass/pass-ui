import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { set } from '@ember/object';

module('Integration | Component | found-manuscripts', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:app-static-config', Service.extend({
      getStaticConfig: () => Promise.resolve({
        assetsUri: '',
        branding: {
          stylesheet: ''
        }
      }),
      addCss: () => {}
    }));

    this.owner.register('service:workflow', Service.extend({
      getDoiInfo: () => ({ DOI: 'doi-moo' })
    }));

    // Dumb service mock to prevent random fetches
    this.owner.register('service:oa-manuscript-service', Service.extend({
      lookup: () => Promise.resolve([]),
      downloadManuscript: () => 'result moo'
    }));
  });

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    await render(hbs`<FoundManuscripts />`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('An OA MS is displayed', async function (assert) {
    // Mock the download service
    const mockMsService = Service.extend({
      lookup(doi) {
        assert.ok(doi, 'DOI needs to be present');
        return Promise.resolve([{
          name: 'This is a moo',
          url: 'http://moo.example.com'
        }]);
      }
    });

    this.owner.register('service:oa-manuscript-service', mockMsService);

    await render(hbs`<FoundManuscripts />`);

    assert.ok(this.element.textContent.includes('This is a moo'));
  });

  test('Nothing renders when disabled', async function (assert) {
    await render(hbs`<FoundManuscripts @disabled="true" />`);
    assert.equal(this.element.childElementCount, 0);
  });

  test('Clicking the filename should "download" and invoke an action', async function (assert) {
    assert.expect(5);

    const mockMsService = Service.extend({
      lookup(doi) {
        assert.ok(doi, 'DOI needs to be present');
        return Promise.resolve([{
          name: 'This is a moo',
          url: 'http://moo.example.com'
        }]);
      },
      downloadManuscript: (url, doi) => {
        assert.ok(url, 'No url provided');
        assert.ok(doi, 'No DOI provided');
        return Promise.resolve(':)');
      }
    });

    this.owner.register('service:oa-manuscript-service', mockMsService);

    const mockAction = () => {
      assert.ok(true);

      return Promise.resolve('I promise');
    };
    set(this, 'mockAction', mockAction);

    await render(hbs`<FoundManuscripts @handleExternalMs={{action mockAction}}/>`);

    assert.dom('[data-test-add-file-link]').includesText('This is a moo');

    await click('[data-test-add-file-link]');
  });
});
