/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
/* eslint-disable ember/no-classic-classes */
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | notice-banner', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const mockStaticConfig = Service.extend({
      config: {
        branding: {
          stylesheet: '',
          pages: {
            contactUrl: 'http://test-contact/',
            instructionsUrl: 'http://test-instructions/',
          },
        },
      },
      addCss: () => {},
    });

    this.owner.register('service:app-static-config', mockStaticConfig);

    await render(hbs`<NoticeBanner />`);
    assert.equal(
      this.element.querySelector('.instructions-url').getAttribute('href'),
      'http://test-instructions/',
      'instruction url populated',
    );
    assert.equal(
      this.element.querySelector('.contact-us-url').getAttribute('href'),
      'http://test-contact/',
      'contact us url populated',
    );
  });
});
