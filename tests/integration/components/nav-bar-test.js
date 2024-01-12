/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
/* eslint-disable ember/no-classic-classes */
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | nav bar', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const mockStaticConfig = Service.extend({
      config: {
        branding: {
          stylesheet: '',
          pages: {
            aboutUrl: '',
            contactUrl: '',
            faqUrl: '',
          },
        },
      },
      addCss: () => {},
    });

    this.owner.register('service:app-static-config', mockStaticConfig);

    await render(hbs`<NavBar />`);
    assert.ok(true);
  });
});
