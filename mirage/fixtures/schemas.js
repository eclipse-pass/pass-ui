export default [
  {
    schema: [
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
                $comment:
                  "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
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
            required: ['$schema', 'title', 'journal-title'],
            title: 'JHU global schema',
            type: 'object',
          },
          {
            anyOf: [
              {
                properties: {
                  'journal-NLMTA-ID': {
                    description: 'NLM identifier for a journal',
                    title: 'NTMLA',
                    type: 'string',
                  },
                },
                required: ['journal-NLMTA-ID'],
                type: 'object',
              },
              {
                properties: {
                  issns: {
                    contains: {
                      properties: {
                        issn: {
                          type: 'string',
                        },
                        pubType: {
                          type: 'string',
                        },
                      },
                      required: ['issn', 'pubType'],
                      type: 'object',
                    },
                    type: 'array',
                  },
                },
                type: 'object',
              },
            ],
          },
          {
            properties: {
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
              'journal-NLMTA-ID': {
                description: 'NLM identifier for a journal',
                title: 'NTMLA',
                type: 'string',
              },
            },
            title:
              "NIH Manuscript Submission System (NIHMS) \u003cbr\u003e\u003cp class='lead text-muted'\u003eThe following metadata fields will be part of the NIHMS submission.\u003c/p\u003e",
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
              publicationDate: {
                $comment:
                  "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
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
          issn_present: {
            properties: {
              issns: {
                contains: {
                  properties: {
                    issn: {
                      type: 'string',
                    },
                    pubType: {
                      type: 'string',
                    },
                  },
                  required: ['issn', 'pubType'],
                  type: 'object',
                },
                type: 'array',
              },
            },
            type: 'object',
          },
          nlmta_present: {
            properties: {
              'journal-NLMTA-ID': {
                description: 'NLM identifier for a journal',
                title: 'NTMLA',
                type: 'string',
              },
            },
            required: ['journal-NLMTA-ID'],
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
          prerequisites: {
            anyOf: [
              {
                properties: {
                  'journal-NLMTA-ID': {
                    description: 'NLM identifier for a journal',
                    title: 'NTMLA',
                    type: 'string',
                  },
                },
                required: ['journal-NLMTA-ID'],
                type: 'object',
              },
              {
                properties: {
                  issns: {
                    contains: {
                      properties: {
                        issn: {
                          type: 'string',
                        },
                        pubType: {
                          type: 'string',
                        },
                      },
                      required: ['issn', 'pubType'],
                      type: 'object',
                    },
                    type: 'array',
                  },
                },
                type: 'object',
              },
            ],
          },
        },
        type: 'object',
      },
    ],
  },
  {
    schema: [
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
                $comment:
                  "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
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
            required: ['$schema', 'title', 'journal-title'],
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
                $comment:
                  "This was formerly date-time format, but that appears too precise for values like 'Summer 2018'",
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
    ],
  },
];
