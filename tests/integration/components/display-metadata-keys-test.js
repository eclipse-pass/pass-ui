import EmberObject from '@ember/object';
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
          orcid: '1234',
        },
        {
          name: 'Moo Too',
        },
      ],
      issns: [
        {
          issn: '1234j-09ufe',
          pubType: 'Online',
        },
      ],
      title: 'This is the title moo',
      'journal-title': 'Journal moo',
    };
    const submission = EmberObject.create({
      metadata: JSON.stringify(mockData),
    });

    const mockSchema = {
      properties: {
        authors: {
          type: 'array',
          title: 'Authors of this article or manuscript',
          description: 'List of authors and their associated ORCIDS, if available',
          uniqueItems: true,
          items: {
            type: 'object',
            title: 'Author',
            properties: {
              author: {
                type: 'string',
              },
              orcid: {
                type: 'string',
              },
            },
          },
        },
        title: {
          type: 'string',
          title: 'Article / Manuscript Title',
          description: 'The title of the individual article or manuscript that was submitted',
        },
        issns: {
          type: 'array',
          title: "ISSN information for the manuscript's journal",
          description: 'List of ISSN numbers with optional publication type',
          uniqueItems: true,
          items: {
            type: 'object',
            title: 'ISSN info',
            properties: {
              issn: {
                type: 'string',
                title: 'ISSN ',
              },
              pubType: {
                type: 'string',
                title: 'publication type',
                enum: ['Print', 'Online'],
              },
            },
          },
        },
        'journal-NLMTA-ID': {
          type: 'string',
          title: 'NTMLA',
          description: 'NLM identifier for a journal',
        },
        'journal-title': {
          type: 'string',
          title: 'Journal title',
          description: 'Title of the journal the individual article or manuscript was submitted to',
        },
      },
    };

    this.set('submission', submission);
    this.owner.lookup('service:metadata-schema').displayMetadata = (submission) => [
      { label: 'Journal nlmta-id', value: 'MOO-ID', isArray: false },
      {
        label: 'Authors',
        isArray: true,
        value: [{ name: 'Moo Jones', orcid: '1234' }, { name: 'Moo Too' }],
      },
      {
        label: 'Issns',
        isArray: true,
        value: [{ issn: '1234j-09ufe', pubType: 'Online' }],
      },
      { label: 'Title', isArray: false, value: 'This is the title moo' },
      { label: 'Journal Title', isArray: false, value: 'Journal moo' },
    ];
  });

  test('Check the "display" blob', async function (assert) {
    await render(hbs`<DisplayMetadataKeys @submission={{this.submission}} />`);

    assert.dom(this.element).includesText('Journal nlmta-id : MOO-ID');
    assert.dom(this.element).includesText('Authors');
    assert.dom(this.element).includesText('name : Moo Jones');
  });
});
