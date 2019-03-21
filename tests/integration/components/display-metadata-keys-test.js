import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | display-metadata-keys', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const mockData = {
      'journal-NLMTA-ID': 'MOO-ID',
      authors: [
        {
          name: 'Moo Jones',
          orcid: '1234'
        },
        {
          name: 'Moo Too'
        }
      ],
      issns: [
        {
          issn: '1234j-09ufe',
          pubType: 'Online'
        }
      ],
      title: 'This is the title moo',
      'journal-title': 'Journal moo'
    };
    const submission = Ember.Object.create({
      metadata: JSON.stringify(mockData)
    });

    this.set('submission', submission);
  });

  test('it renders', async (assert) => {
    const el = await render(hbs`{{display-metadata-keys submission=submission}}`);
    assert.ok(el);
  });

  test('Check the "display" blob', async function (assert) {
    const el = await render(hbs`{{display-metadata-keys submission=submission}}`);

    // const expected = [
    //   { label: 'Journal nlmta-id', value: 'MOO-ID', isArray: false },
    //   {
    //     label: 'Authors',
    //     isArray: true,
    //     value: [
    //       { name: 'Moo Jones', orcid: '1234' },
    //       { name: 'Moo Too' }
    //     ]
    //   },
    //   {
    //     label: 'Issns',
    //     isArray: true,
    //     value: [
    //       { issn: '1234j-09ufe', pubType: 'Online' }
    //     ]
    //   },
    //   { label: 'Title', isArray: false, value: 'This is the title moo' },
    //   { label: 'Journal Title', isArray: false, value: 'Journal moo' }
    // ];

    const allText = this.element.textContent;

    assert.ok(allText.includes('Journal nlmta-id: MOO-ID'), 'Should include "Journal nlmta-id"');
    assert.ok(allText.includes('Authors'), 'Should include "Authors" label');
    assert.ok(allText.includes('name: Moo Jones'), 'Should include author name "Moo Jones"');
  });
});
