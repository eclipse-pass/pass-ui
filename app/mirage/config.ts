/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
const camelize = (str: string) => str.replace(/[-_\s]+(.)?/g, (_: string, c: string) => (c ? c.toUpperCase() : ''));
import { createServer, JSONAPISerializer, Model, Response, belongsTo, hasMany } from 'miragejs';
import type { Server, Request } from 'miragejs';
import doiJournals from './custom-fixtures/nih-submission/doi-journals';
import ENV from 'pass-ui/config/environment';
import MockDataFinder from './service-handler';

// Factories
import journalFactory from './factories/journal';
import policyFactory from './factories/policy';
import publicationFactory from './factories/publication';
import repositoryFactory from './factories/repository';
import submissionFactory from './factories/submission';

// Fixtures
import funderFixtures from './fixtures/funder';
import grantFixtures from './fixtures/grant';
import journalFixtures from './fixtures/journal';
import policyFixtures from './fixtures/policy';
import publicationFixtures from './fixtures/publication';
import repositoryFixtures from './fixtures/repository';
import submissionFixtures from './fixtures/submission';
import userFixtures from './fixtures/user';

/**
 * Mirage route handlers using `function` syntax get a special `this` context
 * with `normalizedRequestAttrs()` and `serialize()` injected at runtime.
 * These are NOT on the Server type, so we define them here.
 */
interface MirageRouteHandler {
  normalizedRequestAttrs(modelName?: string): Record<string, unknown>;
  serialize(resource: unknown): { data: unknown[]; included?: unknown[] };
}

interface PolicyRepoEntry {
  url: string;
  selected: boolean;
}

export default function (config: Record<string, unknown> & { models?: Record<string, unknown> }) {
  const dataFinder = new MockDataFinder(ENV.environment);

  const finalConfig = {
    environment: 'test',
    ...config,
    inflector: {
      pluralize: (word: string) => word,
      singularize: (word: string) => word,
    },
    models: {
      deposit: Model.extend({ repository: belongsTo(), repositoryCopy: belongsTo(), submission: belongsTo() }),
      file: Model.extend({ submission: belongsTo() }),
      funder: Model.extend({ policy: belongsTo() }),
      grant: Model.extend({
        pi: belongsTo('user'),
        coPis: hasMany('user'),
        primaryFunder: belongsTo('funder'),
        directFunder: belongsTo('funder'),
      }),
      journal: Model.extend({}),
      policy: Model.extend({ repositories: hasMany('repository') }),
      publication: Model.extend({ journal: belongsTo() }),
      repository: Model.extend({}),
      repositoryCopy: Model.extend({ repository: belongsTo(), publication: belongsTo() }),
      submission: Model.extend({
        submitter: belongsTo('user'),
        publication: belongsTo(),
        repositories: hasMany('repository'),
        grants: hasMany('grant'),
        preparers: hasMany('user'),
        effectivePolicies: hasMany('policy'),
      }),
      submissionEvent: Model.extend({ submission: belongsTo(), performedBy: belongsTo('user') }),
      user: Model.extend({}),
      ...config.models,
    },
    factories: {
      journal: journalFactory,
      policy: policyFactory,
      publication: publicationFactory,
      repository: repositoryFactory,
      submission: submissionFactory,
    },
    fixtures: {
      funder: funderFixtures,
      grant: grantFixtures,
      journal: journalFixtures,
      policy: policyFixtures,
      publication: publicationFixtures,
      repository: repositoryFixtures,
      submission: submissionFixtures,
      user: userFixtures,
    },
    serializers: {
      application: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
      }),
      grant: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
        include: ['primaryFunder', 'directFunder'],
      }),
      funder: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
        include: ['policy'],
      }),
      publication: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
        include: ['journal'],
      }),
      submission: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
        include: ['grants', 'publication', 'submitter', 'repositories', 'preparers', 'effectivePolicies'],
      }),
      policy: JSONAPISerializer.extend({
        keyForAttribute: (attr: string) => (attr ? camelize(attr) : null),
        keyForRelationship: (key: string) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
        include: ['repositories'],
      }),
    },
    routes(this: Server) {
      this.get('/app/config.json', () => {
        return {
          branding: {
            homepage: 'https://www.eclipse.org/org/foundation/',
            logo: '/app/ef/eclipse_foundation_logo_wo/EF_WHT-OR_png.png',
            favicon: 'favicon.ico',
            stylesheet: '/app/branding.css',
            overrides: '/app/branding-overrides.css',
            pages: {
              showPagesNavBar: false,
            },
            error: {
              icon: '/app/error-icon.png',
            },
          },
        };
      });

      /** User Service */
      this.get('/user/whoami', () => {
        return { user: { id: '0' } };
      });

      /** Download service */
      this.get('/doi/manuscript', () => ({
        manuscripts: [
          {
            url: 'https://dash.harvard.edu/bitstream/1/12285462/1/Nanometer-Scale%20Thermometry.pdf',
            repositoryLabel: 'Harvard University - Digital Access to Scholarship at Harvard (DASH)',
            type: 'application/pdf',
            source: 'Unpaywall',
            name: 'Nanometer-Scale Thermometry.pdf',
          },
          {
            url: 'https://europepmc.org/articles/pmc4221854?pdf=render',
            repositoryLabel: 'pubmedcentral.nih.gov',
            type: 'application/pdf',
            source: 'Unpaywall',
            name: 'pmc4221854?pdf=render',
          },
          {
            url: 'https://arxiv.org/pdf/1304.1068',
            repositoryLabel: 'arXiv.org',
            type: 'application/pdf',
            source: 'Unpaywall',
            name: '1304.1068',
          },
        ],
      }));

      /**
       * ################################################################
       * ##### Only capture data requests for tests #######
       * ################################################################
       */
      // File Service
      this.get('/file/:id', (schema, request) => schema.find('file', request.params.id!));
      this.post('/file', function (this: MirageRouteHandler) {
        return {
          fileName: 'my-submission.pdf',
          mimeType: 'application/pdf',
          uuid: '12abc34xE999',
        };
      });
      this.delete('/file/:id/:name', function () {
        return new Response(200);
      });
      // File API
      this.get('/data/file', (schema, request) => {
        console.log(`[MirageJS] GET /file | query ${JSON.stringify(request.queryParams)}`);
        return schema.none('file');
      });
      this.patch('/data/file/:id');
      this.post('/data/file', function (this: MirageRouteHandler, schema) {
        const attrs = this.normalizedRequestAttrs();

        return schema.create('file', attrs);
      });
      this.delete('/data/file/:id', () => {
        return new Response(204);
      });

      // Users
      this.get('/data/user/:id', (schema, request) => schema.find('user', request.params.id!));
      this.get('/data/user', (schema) =>
        schema.where('user', { displayName: 'Staff Hasgrants' } as Record<string, unknown>),
      );

      // Journals
      this.get('/data/journal/:id', (schema, request) => schema.find('journal', request.params.id!));
      // We could make it generic for the autocomplete service, but not much
      // reason just for tests
      this.get('/data/journal', (schema) =>
        schema.where('journal', { journalName: 'The Analyst' } as Record<string, unknown>),
      );

      // Policies
      this.get('/data/policy', (schema) => schema.all('policy'));
      this.get('/data/policy/:id', (schema, request) => schema.find('policy', request.params.id!));

      // Funders
      this.get('/data/funder/:id', (schema, request) => schema.find('funder', request.params.id!));

      // Repositories
      this.get('/data/repository', (schema) => schema.all('repository'));
      this.get('/data/repository/:id', (schema, request) => schema.find('repository', request.params.id!));

      // Publications
      this.get('/data/publication/:id', (schema, request) => schema.find('publication', request.params.id!));
      this.post('/data/publication', function (this: MirageRouteHandler, schema) {
        const attrs = this.normalizedRequestAttrs();
        return schema.create('publication', attrs);
      });
      this.patch('/data/publication/:id', function (this: MirageRouteHandler, schema, request) {
        const attrs = this.normalizedRequestAttrs('publication');
        const pub = schema.find('publication', request.params.id!);
        pub!.update(attrs);
        return pub;
      });

      // Submissions
      this.get('/data/submission/:id', (schema, request) => schema.find('submission', request.params.id!));
      this.post('/data/submission', function (this: MirageRouteHandler, schema) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.create('submission', attrs);
      });
      this.patch('/data/submission/:id', function (this: MirageRouteHandler, schema, request) {
        const attrs = this.normalizedRequestAttrs('submission');
        const sub = schema.find('submission', request.params.id!);
        sub!.update(attrs);
        return sub;
      });
      // Submission filtering
      this.get('/data/submission', function (this: MirageRouteHandler, schema, request: Request) {
        /**
         * JSON object with query parameter as key, value as value.
         * ex: ?param1=value1&param2=value2
         * { param1: value1, param2: value2 }
         */
        const query = request.queryParams;

        let result;
        if (!query) {
          result = schema.all('submission');
        } else {
          // Find the 'filter[...]' parameter
          let submissionFilter: unknown = Object.keys(query)
            .filter((key: string) => key.includes('filter[submission]'))
            .map((key: string) => query[key]);
          if (!Array.isArray(submissionFilter) || submissionFilter.length !== 1) {
            result = schema.none('submission');
          } else {
            // Once we know query params includes a submission filter, get its value
            submissionFilter = submissionFilter[0];
            result = (submissionFilter as string).includes('cancelled')
              ? schema.all('submission')
              : schema.none('submission');
          }
        }

        // this.serialize() auto-sideloads via the submission serializer's include config
        const serialized = this.serialize(result);
        const pageSize = parseInt((query?.['page[size]'] as string) || '10', 10);
        const pageNumber = parseInt((query?.['page[number]'] as string) || '1', 10);
        const allData = serialized.data || [];
        const totalRecords = allData.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        return {
          ...serialized,
          data: allData.slice(start, end),
          meta: {
            page: {
              totalRecords,
              totalPages,
            },
          },
        };
      });

      // Submission Events
      this.post('/data/submissionEvent', function (this: MirageRouteHandler, schema) {
        const attrs = this.normalizedRequestAttrs('submission-event') as Record<string, unknown>;
        const se = schema.create('submission-event', attrs);

        try {
          const submission = schema.find('submission', attrs.submissionId as string)!;
          (submission as unknown as Record<string, unknown>).submissionStatus =
            attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
          (submission as unknown as { save(): void }).save();
        } catch (e) {
          console.log(e);
        }

        return se;
      });
      this.get('/data/submissionEvent/:id', (schema, request) => schema.find('submission-event', request.params.id!));
      this.get('/data/submissionEvent', (schema) => schema.none('submission-event'));

      // Grants
      this.get('/data/grant/:id', (schema, request) => schema.find('grant', request.params.id!));
      this.get('/data/grant', function (this: MirageRouteHandler, schema, request: Request) {
        const grantsModel = schema.all('grant');
        const grants = this.serialize(grantsModel);
        const allData = grants.data || [];
        const totalRecords = allData.length;
        const pageSize = parseInt((request.queryParams['page[size]'] as string) || '10', 10);
        const pageNumber = parseInt((request.queryParams['page[number]'] as string) || '1', 10);
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        return {
          ...grants,
          data: allData.slice(start, end),
          meta: {
            page: {
              totalRecords,
              totalPages,
            },
          },
        };
      });

      this.get('/data/repositoryCopy/:id', (schema, request) => schema.find('repository-copy', request.params.id!));
      this.get('/data/repositoryCopy', (schema) => schema.none('repository-copy'));

      this.get('/data/deposit/:id', (schema, request) => schema.find('deposit', request.params.id!));
      this.get('/data/deposit', (schema) => schema.none('deposit'));

      /** DOI Service */
      this.get('/doi/journal', (_schema, request) => {
        console.log(`[MirageJS] GET /journal | query: ${JSON.stringify(request.queryParams)}`);
        return {
          'journal-id': doiJournals['journal-id'],
          crossref: doiJournals.crossref,
        };
      });

      /** Policy Service */
      this.get('/policy/policies', async (schema, request) => {
        const jhuPolicy = schema.findBy('policy', {
          title: 'Johns Hopkins University (JHU) Open Access Policy',
        } as Record<string, unknown>)!;
        const policies: Array<{ id: string; type: string }> = [{ id: jhuPolicy.id!, type: 'institution' }];
        const seenIds = new Set([jhuPolicy.id!]);

        const submission = schema.find('submission', request.queryParams.submission as string)!;
        const grants = (submission as unknown as { grants: { models: Array<{ primaryFunder: { id: string } }> } })
          .grants;
        grants.models.forEach((grant) => {
          const funder = schema.find('funder', grant.primaryFunder.id)!;
          const policyId = (funder as unknown as { policyId: string }).policyId;
          const policy = schema.find('policy', policyId)!;

          if (policy.id && !seenIds.has(policy.id)) {
            seenIds.add(policy.id);
            policies.push({ id: policy.id, type: 'funder' });
          }
        });

        return policies;
      });
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policy/repositories', async (schema, request) => {
        const submissionId = request.queryParams.submission as string;
        const submission = schema.find('submission', submissionId)!;
        const publicationId = (submission as unknown as { attrs: { publicationId: string } }).attrs.publicationId;
        const publication = schema.find('publication', publicationId)!;

        const j10p = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'jscholarship' });
        const pmc = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'pmc' });

        const payload: {
          required: PolicyRepoEntry[];
          'one-of': PolicyRepoEntry[][];
          optional: PolicyRepoEntry[];
        } = {
          required: [],
          'one-of': [[{ url: j10p.id, selected: true }]],
          optional: [{ url: j10p.id, selected: true }],
        };

        if ((publication as unknown as { journalId: string | null }).journalId) {
          payload.required.push({ url: pmc.id, selected: false });
          payload['one-of'][0]!.push({ url: pmc.id, selected: false });
        }

        return payload;
      });

      /**
       * ################################################################
       * ##### Pass through everything else #############################
       * ################################################################
       */
      this.passthrough('http://localhost/**');
      this.passthrough('https://localhost/**');

      this.passthrough('http://pass.local/**');
      this.passthrough('https://pass.local/**');

      this.passthrough('http://demo.eclipse-pass.org/**');
      this.passthrough('https://demo.eclipse-pass.org/**');

      this.passthrough('http://nightly.eclipse-pass.org/**');
      this.passthrough('https://nightly.eclipse-pass.org/**');

      this.passthrough();
    },
  };

  const server = createServer(finalConfig);
  server.logging = true;

  // In test mode with factories present, miragejs skips auto-loading fixtures.
  // Explicitly load them so fixture data is available for route handlers.
  server.loadFixtures();

  server.create('journal', {
    id: '10',
    issns: ['Print:0003-2654', 'Online:1364-5528'],
    journalName: 'The Analyst',
    nlmta: 'Analyst',
    pmcParticipation: 'B',
  } as Record<string, unknown>);

  return server;
}
