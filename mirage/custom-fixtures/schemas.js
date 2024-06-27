export default [
  {
    type: 'object',
    definitions: {
      form: {
        type: 'object',
        title:
          "Johns Hopkins - JScholarship <br><p class='lead text-muted'>Deposit requirements for JH's institutional repository JScholarship</p>",
        $comment: 'These properties are intended to be displayed in an Alpaca form',
        properties: {
          title: {
            type: 'string',
            title: 'Article / Manuscript Title',
            description: 'The title of the individual article or manuscript that was submitted',
          },
          'journal-title': {
            type: 'string',
            title: 'Journal title',
            description: 'Title of the journal the individual article or manuscript was submitted to',
          },
          volume: {
            type: 'string',
            title: 'Journal Volume',
            description: 'journal volume this article or manuscript was published in',
          },
          issue: {
            type: 'string',
            title: 'Journal issue',
            description: 'Issue number of the journal this article or manuscript was submitted to',
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
          publisher: {
            type: 'string',
            title: 'Publisher',
            description: 'Publisher of the journal this article or manuscript was submitted to',
          },
          publicationDate: {
            type: 'string',
            title: 'Publication Date',
            description: 'Publication date of the journal or article this manuscript was submitted to',
            $comment: "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
          },
          abstract: {
            type: 'string',
            title: 'Abstract',
            description: 'The abstract of the article or manuscript being submitted',
          },
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
              required: ['author'],
            },
          },
          'under-embargo': {
            type: 'string',
            title: 'Under Embargo',
            description: 'Indicates wither the article or manuscript is under embargo',
            $comment: 'This should probably be a boolean',
          },
          'Embargo-end-date': {
            type: 'string',
            format: 'date',
            title: 'Embargo end date',
            description: 'Date at which the article or manuscript may be made public',
          },
        },
        dependencies: {
          'Embargo-end-date': ['under-embargo'],
        },
        options: {
          fields: {
            title: {
              type: 'textarea',
              label: 'Article / Manuscript Title',
              placeholder: 'Enter the manuscript title',
              rows: 2,
              cols: 100,
              hidden: false,
              readonly: true,
              order: 1,
            },
            'journal-title': {
              type: 'text',
              label: 'Journal Title',
              placeholder: 'Enter the journal title',
              hidden: false,
              readonly: true,
              order: 2,
            },
            'journal-NLMTA-ID': {
              type: 'text',
              label: 'Journal NLMTA ID',
              placeholder: 'nlmta',
              readonly: true,
              order: 3,
            },
            volume: {
              type: 'text',
              label: 'Volume  <small class="text-muted">(optional)</small>',
              placeholder: 'Enter the volume',
              hidden: false,
              order: 4,
            },
            issue: {
              type: 'text',
              label: 'Issue  <small class="text-muted">(optional)</small>',
              placeholder: 'Enter issue',
              hidden: false,
              order: 5,
            },
            issns: {
              label: '<div>ISSN Information</div><hr/>',
              hidden: false,
              readonly: true,
              collapsible: false,
              collapsed: false,
              fieldClass: '',
              toolbar: {
                actions: [
                  {
                    action: 'add',
                    enabled: false,
                  },
                ],
              },
              actionbar: {
                actions: [
                  {
                    action: 'add',
                    enabled: false,
                  },
                  {
                    action: 'remove',
                    enabled: false,
                  },
                  {
                    action: 'up',
                    enabled: false,
                  },
                  {
                    action: 'down',
                    enabled: false,
                  },
                ],
              },
              items: {
                label: '<span class="d-none"></span>',
                fieldClass: 'row',
                fields: {
                  issn: {
                    label: 'ISSN',
                    fieldClass: 'body-text col-6 pull-left ',
                  },
                  pubType: {
                    label: 'Publication Type',
                    fieldClass: 'body-text col-6 pull-left md-pubtype',
                    vertical: false,
                    removeDefaultNone: true,
                  },
                },
              },
              order: 6,
            },
            publisher: {
              type: 'text',
              label: 'Publisher <small class="text-muted">(optional)</small>',
              placeholder: 'Enter the Publisher',
              hidden: false,
              order: 7,
            },
            publicationDate: {
              type: 'date',
              label: 'Publication Date  <small class="text-muted">(optional)</small>',
              hidden: false,
              order: 8,
            },
            abstract: {
              type: 'textarea',
              label: 'Abstract <small class="text-muted">(optional)</small>',
              placeholder: 'Enter abstract',
              fieldClass: 'clearfix',
              hidden: false,
              order: 9,
            },
            authors: {
              label: '<div>Authors</div><hr/>',
              hidden: false,
              collapsible: false,
              collapsed: false,
              items: {
                label: '<span class="d-none"></span>',
                fields: {
                  author: {
                    label: 'Name',
                    fieldClass: 'body-text col-6 pull-left pl-0',
                  },
                  orcid: {
                    label: 'ORCiD',
                    fieldClass: 'body-text col-6 pull-left pr-0',
                  },
                },
              },
              order: 10,
            },
            'under-embargo': {
              type: 'checkbox',
              rightLabel: 'The material being submitted is published under an embargo.',
              fieldClass: 'm-0 mt-4',
              hidden: false,
              order: 11,
            },
            'Embargo-end-date': {
              type: 'date',
              label: 'Embargo End Date',
              helper:
                '<i>After the embargo end date, your submission manuscripts or article can be made public. <b>If this publication is not under embargo, please leave this field blank.<b></i>',
              helpersPosition: 'above',
              placeholder: 'dd/mm/yyyy',
              validate: true,
              inputType: 'date',
              fieldClass: 'date-time-picker',
              picker: {
                format: 'MM/DD/YY',
                allowInputToggle: true,
              },
              order: 12,
              dependencies: {
                'under-embargo': true,
              },
            },
          },
        },
        required: ['authors'],
      },
      options: {
        fields: {
          title: {
            type: 'textarea',
            label: 'Article / Manuscript Title',
            placeholder: 'Enter the manuscript title',
            rows: 2,
            cols: 100,
            hidden: false,
            readonly: true,
            order: 1,
          },
          'journal-title': {
            type: 'text',
            label: 'Journal Title',
            placeholder: 'Enter the journal title',
            hidden: false,
            readonly: true,
            order: 2,
          },
          'journal-NLMTA-ID': {
            type: 'text',
            label: 'Journal NLMTA ID',
            placeholder: 'nlmta',
            readonly: true,
            order: 3,
          },
          volume: {
            type: 'text',
            label: 'Volume  <small class="text-muted">(optional)</small>',
            placeholder: 'Enter the volume',
            hidden: false,
            order: 4,
          },
          issue: {
            type: 'text',
            label: 'Issue  <small class="text-muted">(optional)</small>',
            placeholder: 'Enter issue',
            hidden: false,
            order: 5,
          },
          issns: {
            label: '<div>ISSN Information</div><hr/>',
            hidden: false,
            readonly: true,
            collapsible: false,
            collapsed: false,
            fieldClass: '',
            toolbar: {
              actions: [
                {
                  action: 'add',
                  enabled: false,
                },
              ],
            },
            actionbar: {
              actions: [
                {
                  action: 'add',
                  enabled: false,
                },
                {
                  action: 'remove',
                  enabled: false,
                },
                {
                  action: 'up',
                  enabled: false,
                },
                {
                  action: 'down',
                  enabled: false,
                },
              ],
            },
            items: {
              label: '<span class="d-none"></span>',
              fieldClass: 'row',
              fields: {
                issn: {
                  label: 'ISSN',
                  fieldClass: 'body-text col-6 pull-left ',
                },
                pubType: {
                  label: 'Publication Type',
                  fieldClass: 'body-text col-6 pull-left md-pubtype',
                  vertical: false,
                  removeDefaultNone: true,
                },
              },
            },
            order: 6,
          },
          publisher: {
            type: 'text',
            label: 'Publisher <small class="text-muted">(optional)</small>',
            placeholder: 'Enter the Publisher',
            hidden: false,
            order: 7,
          },
          publicationDate: {
            type: 'date',
            label: 'Publication Date  <small class="text-muted">(optional)</small>',
            hidden: false,
            order: 8,
          },
          abstract: {
            type: 'textarea',
            label: 'Abstract <small class="text-muted">(optional)</small>',
            placeholder: 'Enter abstract',
            fieldClass: 'clearfix',
            hidden: false,
            order: 9,
          },
          authors: {
            label: '<div>Authors</div><hr/>',
            hidden: false,
            collapsible: false,
            collapsed: false,
            items: {
              label: '<span class="d-none"></span>',
              fields: {
                author: {
                  label: 'Name',
                  fieldClass: 'body-text col-6 pull-left pl-0',
                },
                orcid: {
                  label: 'ORCiD',
                  fieldClass: 'body-text col-6 pull-left pr-0',
                },
              },
            },
            order: 10,
          },
          'under-embargo': {
            type: 'checkbox',
            rightLabel: 'The material being submitted is published under an embargo.',
            fieldClass: 'm-0 mt-4',
            hidden: false,
            order: 11,
          },
          'Embargo-end-date': {
            type: 'date',
            label: 'Embargo End Date',
            helper:
              '<i>After the embargo end date, your submission manuscripts or article can be made public. <b>If this publication is not under embargo, please leave this field blank.<b></i>',
            helpersPosition: 'above',
            placeholder: 'dd/mm/yyyy',
            validate: true,
            inputType: 'date',
            fieldClass: 'date-time-picker',
            picker: {
              format: 'MM/DD/YY',
              allowInputToggle: true,
            },
            order: 12,
            dependencies: {
              'under-embargo': true,
            },
          },
        },
      },
    },
    allOf: [
      {
        title: 'JHU global schema',
        description: 'Defines all possible metadata fields for PASS deposit',
        $id: 'https://eclipse-pass.github.io/pass-metadata-schemas/schemas/jhu/global.json',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        required: ['$schema', 'title'],
        additionalProperties: false,
        properties: {
          $schema: {
            type: 'string',
            title: 'JSON schema',
            description: 'The JSON schema that applies to the resulting metadata blob',
          },
          agreements: {
            type: 'object',
            title: 'Agreements to deposit conditions',
            description:
              'Maps repository keys to the text or links containing the agreements accepted by the submitter',
            $comment: "This was formerly known as 'embargo', available only for JScholarship metadata",
            patternProperties: {
              '^.+$': {
                type: 'string',
                title: 'Agreement',
                description: 'Text or link agreed to for the given repository key',
                $comment: "Example: {'jScholarship': 'http://example.org/agreementText'}",
              },
            },
          },
          abstract: {
            type: 'string',
            title: 'Abstract',
            description: 'The abstract of the article or manuscript being submitted',
          },
          agent_information: {
            type: 'object',
            title: 'User agent (browser) information',
            description: "Contains the identity and version of the user's browser",
            properties: {
              name: {
                type: 'string',
                title: 'User agent (browser) name',
              },
              version: {
                type: 'string',
                title: 'User agent (browser) version',
              },
            },
          },
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
              required: ['author'],
            },
          },
          doi: {
            type: 'string',
            pattern: '^10\\..+?/.+?$',
            title: 'DOI of article',
            description: 'The DOI of the individual article or manuscript submitted',
          },
          'Embargo-end-date': {
            type: 'string',
            format: 'date',
            title: 'Embargo end date',
            description: 'Date at which the article or manuscript may be made public',
          },
          hints: {
            type: 'object',
            title: 'Hints provided by the UI to backend services',
            description:
              'Hints have semantics shared by the UI and the backend that are intended to influence the backend processing of the submission.',
            additionalProperties: false,
            properties: {
              'collection-tags': {
                type: 'array',
                uniqueItems: true,
                title: 'Tags impacting the collection used by Deposit Services for deposit',
                items: {
                  type: 'string',
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
          'journal-title-short': {
            type: 'string',
            title: 'Short journal title',
            description: 'Short journal title from CrossRef',
          },
          issue: {
            type: 'string',
            title: 'Journal issue',
            description: 'Issue number of the journal this article or manuscript was submitted to',
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
          publisher: {
            type: 'string',
            title: 'Publisher',
            description: 'Publisher of the journal this article or manuscript was submitted to',
          },
          publicationDate: {
            type: 'string',
            title: 'Publication Date',
            description: 'Publication date of the journal or article this manuscript was submitted to',
            $comment: "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
          },
          title: {
            type: 'string',
            title: 'Article / Manuscript Title',
            description: 'The title of the individual article or manuscript that was submitted',
          },
          'under-embargo': {
            type: 'string',
            title: 'Under Embargo',
            description: 'Indicates wither the article or manuscript is under embargo',
            $comment: 'This should probably be a boolean',
          },
          volume: {
            type: 'string',
            title: 'Journal Volume',
            description: 'journal volume this article or manuscript was published in',
          },
        },
        dependencies: {
          'Embargo-end-date': ['under-embargo'],
        },
        options: {
          fields: {
            title: {
              type: 'textarea',
              label: 'Article / Manuscript Title',
              placeholder: 'Enter the manuscript title',
              rows: 2,
              cols: 100,
              hidden: false,
              readonly: true,
              order: 1,
            },
            'journal-title': {
              type: 'text',
              label: 'Journal Title',
              placeholder: 'Enter the journal title',
              hidden: false,
              readonly: true,
              order: 2,
            },
            'journal-NLMTA-ID': {
              type: 'text',
              label: 'Journal NLMTA ID',
              placeholder: 'nlmta',
              readonly: true,
              order: 3,
            },
            volume: {
              type: 'text',
              label: 'Volume  <small class="text-muted">(optional)</small>',
              placeholder: 'Enter the volume',
              hidden: false,
              order: 4,
            },
            issue: {
              type: 'text',
              label: 'Issue  <small class="text-muted">(optional)</small>',
              placeholder: 'Enter issue',
              hidden: false,
              order: 5,
            },
            issns: {
              label: '<div>ISSN Information</div><hr/>',
              hidden: false,
              readonly: true,
              collapsible: false,
              collapsed: false,
              fieldClass: '',
              toolbar: {
                actions: [
                  {
                    action: 'add',
                    enabled: false,
                  },
                ],
              },
              actionbar: {
                actions: [
                  {
                    action: 'add',
                    enabled: false,
                  },
                  {
                    action: 'remove',
                    enabled: false,
                  },
                  {
                    action: 'up',
                    enabled: false,
                  },
                  {
                    action: 'down',
                    enabled: false,
                  },
                ],
              },
              items: {
                label: '<span class="d-none"></span>',
                fieldClass: 'row',
                fields: {
                  issn: {
                    label: 'ISSN',
                    fieldClass: 'body-text col-6 pull-left ',
                  },
                  pubType: {
                    label: 'Publication Type',
                    fieldClass: 'body-text col-6 pull-left md-pubtype',
                    vertical: false,
                    removeDefaultNone: true,
                  },
                },
              },
              order: 6,
            },
            publisher: {
              type: 'text',
              label: 'Publisher <small class="text-muted">(optional)</small>',
              placeholder: 'Enter the Publisher',
              hidden: false,
              order: 7,
            },
            publicationDate: {
              type: 'date',
              label: 'Publication Date  <small class="text-muted">(optional)</small>',
              hidden: false,
              order: 8,
            },
            abstract: {
              type: 'textarea',
              label: 'Abstract <small class="text-muted">(optional)</small>',
              placeholder: 'Enter abstract',
              fieldClass: 'clearfix',
              hidden: false,
              order: 9,
            },
            authors: {
              label: '<div>Authors</div><hr/>',
              hidden: false,
              collapsible: false,
              collapsed: false,
              items: {
                label: '<span class="d-none"></span>',
                fields: {
                  author: {
                    label: 'Name',
                    fieldClass: 'body-text col-6 pull-left pl-0',
                  },
                  orcid: {
                    label: 'ORCiD',
                    fieldClass: 'body-text col-6 pull-left pr-0',
                  },
                },
              },
              order: 10,
            },
            'under-embargo': {
              type: 'checkbox',
              rightLabel: 'The material being submitted is published under an embargo.',
              fieldClass: 'm-0 mt-4',
              hidden: false,
              order: 11,
            },
            'Embargo-end-date': {
              type: 'date',
              label: 'Embargo End Date',
              helper:
                '<i>After the embargo end date, your submission manuscripts or article can be made public. <b>If this publication is not under embargo, please leave this field blank.<b></i>',
              helpersPosition: 'above',
              placeholder: 'dd/mm/yyyy',
              validate: true,
              inputType: 'date',
              fieldClass: 'date-time-picker',
              picker: {
                format: 'MM/DD/YY',
                allowInputToggle: true,
              },
              order: 12,
              dependencies: {
                'under-embargo': true,
              },
            },
          },
        },
      },
      {
        title:
          "Johns Hopkins - JScholarship <br><p class='lead text-muted'>Deposit requirements for JH's institutional repository JScholarship</p>",
        type: 'object',
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
              required: ['author'],
            },
          },
        },
        required: ['authors'],
      },
    ],
  },
  {
    allOf: [
      {
        $id: 'https://oa-pass.github.io/metadata-schemas/jhu/global.json',
        $schema: 'http://json-schema.org/draft-07/schema#',
        additionalProperties: false,
        dependencies: {
          'Embargo-end-date': ['under-embargo'],
        },
        description: 'Defines all possible metadata fields for PASS deposit',
        options: {
          fields: {
            'Embargo-end-date': {
              dependencies: {
                'under-embargo': true,
              },
              fieldClass: 'date-time-picker',
              helper:
                '\u003ci\u003eAfter the embargo end date, your submission manuscripts or article can be made public. \u003cb\u003eIf this publication is not under embargo, please leave this field blank.\u003cb\u003e\u003c/i\u003e',
              helpersPosition: 'above',
              inputType: 'date',
              label: 'Embargo End Date',
              order: 12,
              picker: {
                allowInputToggle: true,
                format: 'MM/DD/YY',
              },
              placeholder: 'dd/mm/yyyy',
              type: 'date',
              validate: true,
            },
            abstract: {
              fieldClass: 'clearfix',
              hidden: false,
              label: 'Abstract \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 9,
              placeholder: 'Enter abstract',
              type: 'textarea',
            },
            authors: {
              hidden: false,
              items: {
                fields: {
                  author: {
                    fieldClass: 'body-text col-6 pull-left pl-0',
                    label: 'Name',
                  },
                  orcid: {
                    fieldClass: 'body-text col-6 pull-left pr-0',
                    label: 'ORCiD',
                  },
                },
                label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
              },
              label: '\u003cdiv\u003eAuthors\u003c/div\u003e\u003chr/\u003e',
              order: 10,
            },
            issns: {
              fieldClass: '',
              hidden: false,
              items: {
                fieldClass: 'row',
                fields: {
                  issn: {
                    fieldClass: 'body-text col-6 pull-left ',
                    label: 'ISSN',
                  },
                  pubType: {
                    fieldClass: 'body-text col-6 pull-left md-pubtype',
                    label: 'Publication Type',
                    removeDefaultNone: true,
                    vertical: false,
                  },
                },
                label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
              },
              label: '\u003cdiv\u003eISSN Information\u003c/div\u003e\u003chr/\u003e',
              order: 6,
            },
            issue: {
              hidden: false,
              label: 'Issue  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 5,
              placeholder: 'Enter issue',
              type: 'text',
            },
            'journal-NLMTA-ID': {
              label: 'Journal NLMTA ID \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 3,
              placeholder: 'nlmta',
              type: 'text',
            },
            'journal-title': {
              hidden: false,
              label: 'Journal Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
              order: 2,
              placeholder: 'Enter the journal title',
              type: 'text',
            },
            publicationDate: {
              hidden: false,
              label: 'Publication Date  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 8,
              type: 'date',
            },
            publisher: {
              hidden: false,
              label: 'Publisher \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 7,
              placeholder: 'Enter the Publisher',
              type: 'text',
            },
            title: {
              cols: 100,
              hidden: false,
              label: 'Article / Manuscript Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
              order: 1,
              placeholder: 'Enter the manuscript title',
              rows: 2,
              type: 'textarea',
            },
            'under-embargo': {
              fieldClass: 'm-0 mt-4',
              hidden: false,
              order: 11,
              rightLabel: 'The material being submitted is published under an embargo.',
              type: 'checkbox',
            },
            volume: {
              hidden: false,
              label: 'Volume  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 4,
              placeholder: 'Enter the volume',
              type: 'text',
            },
          },
        },
        properties: {
          $schema: {
            description: 'The JSON schema that applies to the resulting metadata blob',
            title: 'JSON schema',
            type: 'string',
          },
          'Embargo-end-date': {
            description: 'Date at which the article or manuscript may be made public',
            format: 'date',
            title: 'Embargo end date',
            type: 'string',
          },
          abstract: {
            description: 'The abstract of the article or manuscript being submitted',
            title: 'Abstract',
            type: 'string',
          },
          agent_information: {
            description: "Contains the identity and version of the user's browser",
            properties: {
              name: {
                title: 'User agent (browser) name',
                type: 'string',
              },
              version: {
                title: 'User agent (browser) version',
                type: 'string',
              },
            },
            title: 'User agent (browser) information',
            type: 'object',
          },
          agreements: {
            $comment: "This was formerly known as 'embargo', available only for JScholarship metadata",
            description:
              'Maps repository keys to the text or links containing the agreements accepted by the submitter',
            patternProperties: {
              '^.+$': {
                $comment: "Example: {'jScholarship': 'http://example.org/agreementText'}",
                description: 'Text or link agreed to for the given repository key',
                title: 'Agreement',
                type: 'string',
              },
            },
            title: 'Agreements to deposit conditions',
            type: 'object',
          },
          authors: {
            description: 'List of authors and their associated ORCIDS, if available',
            items: {
              properties: {
                author: {
                  type: 'string',
                },
                orcid: {
                  type: 'string',
                },
              },
              required: ['author'],
              title: 'Author',
              type: 'object',
            },
            title: 'Authors of this article or manuscript',
            type: 'array',
            uniqueItems: true,
          },
          doi: {
            description: 'The DOI of the individual article or manuscript submitted',
            pattern: '^10\\..+?/.+?$',
            title: 'DOI of article',
            type: 'string',
          },
          hints: {
            additionalProperties: false,
            description:
              'Hints have semantics shared by the UI and the backend that are intended to influence the backend processing of the submission.',
            properties: {
              'collection-tags': {
                items: {
                  type: 'string',
                },
                title: 'Tags impacting the collection used by Deposit Services for deposit',
                type: 'array',
                uniqueItems: true,
              },
            },
            title: 'Hints provided by the UI to backend services',
            type: 'object',
          },
          issns: {
            description: 'List of ISSN numbers with optional publication type',
            items: {
              properties: {
                issn: {
                  title: 'ISSN ',
                  type: 'string',
                },
                pubType: {
                  enum: ['Print', 'Online'],
                  title: 'publication type',
                  type: 'string',
                },
              },
              title: 'ISSN info',
              type: 'object',
            },
            title: "ISSN information for the manuscript's journal",
            type: 'array',
            uniqueItems: true,
          },
          issue: {
            description: 'Issue number of the journal this article or manuscript was submitted to',
            title: 'Journal issue',
            type: 'string',
          },
          'journal-NLMTA-ID': {
            description: 'NLM identifier for a journal',
            title: 'NTMLA',
            type: 'string',
          },
          'journal-title': {
            description: 'Title of the journal the individual article or manuscript was submitted to',
            title: 'Journal title',
            type: 'string',
          },
          'journal-title-short': {
            description: 'Short journal title from CrossRef',
            title: 'Short journal title',
            type: 'string',
          },
          publicationDate: {
            $comment: "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
            description: 'Publication date of the journal or article this manuscript was submitted to',
            title: 'Publication Date',
            type: 'string',
          },
          publisher: {
            description: 'Publisher of the journal this article or manuscript was submitted to',
            title: 'Publisher',
            type: 'string',
          },
          title: {
            description: 'The title of the individual article or manuscript that was submitted',
            title: 'Article / Manuscript Title',
            type: 'string',
          },
          'under-embargo': {
            $comment: 'This should probably be a boolean',
            description: 'Indicates wither the article or manuscript is under embargo',
            title: 'Under Embargo',
            type: 'string',
          },
          volume: {
            description: 'journal volume this article or manuscript was published in',
            title: 'Journal Volume',
            type: 'string',
          },
        },
        required: ['$schema', 'title'],
        title: 'JHU global schema',
        type: 'object',
      },
      {
        properties: {
          authors: {
            description: 'List of authors and their associated ORCIDS, if available',
            items: {
              properties: {
                author: {
                  type: 'string',
                },
                orcid: {
                  type: 'string',
                },
              },
              required: ['author'],
              title: 'Author',
              type: 'object',
            },
            title: 'Authors of this article or manuscript',
            type: 'array',
            uniqueItems: true,
          },
        },
        required: ['authors'],
        title:
          "Johns Hopkins - JScholarship \u003cbr\u003e\u003cp class='lead text-muted'\u003eDeposit requirements for JH's institutional repository JScholarship\u003c/p\u003e",
        type: 'object',
      },
    ],
    definitions: {
      form: {
        $comment: 'These properties are intended to be displayed in an Alpaca form',
        dependencies: {
          'Embargo-end-date': ['under-embargo'],
        },
        options: {
          fields: {
            'Embargo-end-date': {
              dependencies: {
                'under-embargo': true,
              },
              fieldClass: 'date-time-picker',
              helper:
                '\u003ci\u003eAfter the embargo end date, your submission manuscripts or article can be made public. \u003cb\u003eIf this publication is not under embargo, please leave this field blank.\u003cb\u003e\u003c/i\u003e',
              helpersPosition: 'above',
              inputType: 'date',
              label: 'Embargo End Date',
              order: 12,
              picker: {
                allowInputToggle: true,
                format: 'MM/DD/YY',
              },
              placeholder: 'dd/mm/yyyy',
              type: 'date',
              validate: true,
            },
            abstract: {
              fieldClass: 'clearfix',
              hidden: false,
              label: 'Abstract \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 9,
              placeholder: 'Enter abstract',
              type: 'textarea',
            },
            authors: {
              hidden: false,
              items: {
                fields: {
                  author: {
                    fieldClass: 'body-text col-6 pull-left pl-0',
                    label: 'Name',
                  },
                  orcid: {
                    fieldClass: 'body-text col-6 pull-left pr-0',
                    label: 'ORCiD',
                  },
                },
                label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
              },
              label: '\u003cdiv\u003eAuthors\u003c/div\u003e\u003chr/\u003e',
              order: 10,
            },
            issns: {
              fieldClass: '',
              hidden: false,
              items: {
                fieldClass: 'row',
                fields: {
                  issn: {
                    fieldClass: 'body-text col-6 pull-left ',
                    label: 'ISSN',
                  },
                  pubType: {
                    fieldClass: 'body-text col-6 pull-left md-pubtype',
                    label: 'Publication Type',
                    removeDefaultNone: true,
                    vertical: false,
                  },
                },
                label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
              },
              label: '\u003cdiv\u003eISSN Information\u003c/div\u003e\u003chr/\u003e',
              order: 6,
            },
            issue: {
              hidden: false,
              label: 'Issue  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 5,
              placeholder: 'Enter issue',
              type: 'text',
            },
            'journal-NLMTA-ID': {
              label: 'Journal NLMTA ID \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 3,
              placeholder: 'nlmta',
              type: 'text',
            },
            'journal-title': {
              hidden: false,
              label: 'Journal Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
              order: 2,
              placeholder: 'Enter the journal title',
              type: 'text',
            },
            publicationDate: {
              hidden: false,
              label: 'Publication Date  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 8,
              type: 'date',
            },
            publisher: {
              hidden: false,
              label: 'Publisher \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 7,
              placeholder: 'Enter the Publisher',
              type: 'text',
            },
            title: {
              cols: 100,
              hidden: false,
              label: 'Article / Manuscript Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
              order: 1,
              placeholder: 'Enter the manuscript title',
              rows: 2,
              type: 'textarea',
            },
            'under-embargo': {
              fieldClass: 'm-0 mt-4',
              hidden: false,
              order: 11,
              rightLabel: 'The material being submitted is published under an embargo.',
              type: 'checkbox',
            },
            volume: {
              hidden: false,
              label: 'Volume  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
              order: 4,
              placeholder: 'Enter the volume',
              type: 'text',
            },
          },
        },
        properties: {
          'Embargo-end-date': {
            description: 'Date at which the article or manuscript may be made public',
            format: 'date',
            title: 'Embargo end date',
            type: 'string',
          },
          abstract: {
            description: 'The abstract of the article or manuscript being submitted',
            title: 'Abstract',
            type: 'string',
          },
          authors: {
            description: 'List of authors and their associated ORCIDS, if available',
            items: {
              properties: {
                author: {
                  type: 'string',
                },
                orcid: {
                  type: 'string',
                },
              },
              required: ['author'],
              title: 'Author',
              type: 'object',
            },
            title: 'Authors of this article or manuscript',
            type: 'array',
            uniqueItems: true,
          },
          issns: {
            description: 'List of ISSN numbers with optional publication type',
            items: {
              properties: {
                issn: {
                  title: 'ISSN ',
                  type: 'string',
                },
                pubType: {
                  enum: ['Print', 'Online'],
                  title: 'publication type',
                  type: 'string',
                },
              },
              title: 'ISSN info',
              type: 'object',
            },
            title: "ISSN information for the manuscript's journal",
            type: 'array',
            uniqueItems: true,
          },
          issue: {
            description: 'Issue number of the journal this article or manuscript was submitted to',
            title: 'Journal issue',
            type: 'string',
          },
          'journal-title': {
            description: 'Title of the journal the individual article or manuscript was submitted to',
            title: 'Journal title',
            type: 'string',
          },
          publicationDate: {
            $comment: "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
            description: 'Publication date of the journal or article this manuscript was submitted to',
            title: 'Publication Date',
            type: 'string',
          },
          publisher: {
            description: 'Publisher of the journal this article or manuscript was submitted to',
            title: 'Publisher',
            type: 'string',
          },
          title: {
            description: 'The title of the individual article or manuscript that was submitted',
            title: 'Article / Manuscript Title',
            type: 'string',
          },
          'under-embargo': {
            $comment: 'This should probably be a boolean',
            description: 'Indicates wither the article or manuscript is under embargo',
            title: 'Under Embargo',
            type: 'string',
          },
          volume: {
            description: 'journal volume this article or manuscript was published in',
            title: 'Journal Volume',
            type: 'string',
          },
        },
        required: ['authors'],
        title:
          "Johns Hopkins - JScholarship \u003cbr\u003e\u003cp class='lead text-muted'\u003eDeposit requirements for JH's institutional repository JScholarship\u003c/p\u003e",
        type: 'object',
      },
      options: {
        fields: {
          'Embargo-end-date': {
            dependencies: {
              'under-embargo': true,
            },
            fieldClass: 'date-time-picker',
            helper:
              '\u003ci\u003eAfter the embargo end date, your submission manuscripts or article can be made public. \u003cb\u003eIf this publication is not under embargo, please leave this field blank.\u003cb\u003e\u003c/i\u003e',
            helpersPosition: 'above',
            inputType: 'date',
            label: 'Embargo End Date',
            order: 12,
            picker: {
              allowInputToggle: true,
              format: 'MM/DD/YY',
            },
            placeholder: 'dd/mm/yyyy',
            type: 'date',
            validate: true,
          },
          abstract: {
            fieldClass: 'clearfix',
            hidden: false,
            label: 'Abstract \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 9,
            placeholder: 'Enter abstract',
            type: 'textarea',
          },
          authors: {
            hidden: false,
            items: {
              fields: {
                author: {
                  fieldClass: 'body-text col-6 pull-left pl-0',
                  label: 'Name',
                },
                orcid: {
                  fieldClass: 'body-text col-6 pull-left pr-0',
                  label: 'ORCiD',
                },
              },
              label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
            },
            label: '\u003cdiv\u003eAuthors\u003c/div\u003e\u003chr/\u003e',
            order: 10,
          },
          issns: {
            fieldClass: '',
            hidden: false,
            items: {
              fieldClass: 'row',
              fields: {
                issn: {
                  fieldClass: 'body-text col-6 pull-left ',
                  label: 'ISSN',
                },
                pubType: {
                  fieldClass: 'body-text col-6 pull-left md-pubtype',
                  label: 'Publication Type',
                  removeDefaultNone: true,
                  vertical: false,
                },
              },
              label: '\u003cspan class="d-none"\u003e\u003c/span\u003e',
            },
            label: '\u003cdiv\u003eISSN Information\u003c/div\u003e\u003chr/\u003e',
            order: 6,
          },
          issue: {
            hidden: false,
            label: 'Issue  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 5,
            placeholder: 'Enter issue',
            type: 'text',
          },
          'journal-NLMTA-ID': {
            label: 'Journal NLMTA ID \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 3,
            placeholder: 'nlmta',
            type: 'text',
          },
          'journal-title': {
            hidden: false,
            label: 'Journal Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
            order: 2,
            placeholder: 'Enter the journal title',
            type: 'text',
          },
          publicationDate: {
            hidden: false,
            label: 'Publication Date  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 8,
            type: 'date',
          },
          publisher: {
            hidden: false,
            label: 'Publisher \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 7,
            placeholder: 'Enter the Publisher',
            type: 'text',
          },
          title: {
            cols: 100,
            hidden: false,
            label: 'Article / Manuscript Title \u003csmall class="text-muted"\u003e(required)\u003c/small\u003e',
            order: 1,
            placeholder: 'Enter the manuscript title',
            rows: 2,
            type: 'textarea',
          },
          'under-embargo': {
            fieldClass: 'm-0 mt-4',
            hidden: false,
            order: 11,
            rightLabel: 'The material being submitted is published under an embargo.',
            type: 'checkbox',
          },
          volume: {
            hidden: false,
            label: 'Volume  \u003csmall class="text-muted"\u003e(optional)\u003c/small\u003e',
            order: 4,
            placeholder: 'Enter the volume',
            type: 'text',
          },
        },
      },
    },
    type: 'object',
  },
];
