/* eslint-disable @typescript-eslint/no-explicit-any, ember/avoid-leaking-state-in-ember-objects */
const camelize = (str: string) => str.replace(/[-_\s]+(.)?/g, (_: string, c: string) => (c ? c.toUpperCase() : ''));
import { createServer, JSONAPISerializer, Model, Response, belongsTo, hasMany } from 'miragejs';
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

export default function (config: any) {
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
    routes(this: any) {
      this.get('/app/config.json', (_schema: any, _request: any) => {
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
      this.get('/user/whoami', (_schema: any, _request: any) => {
        return { user: { id: '0' } };
      });

      /** Download service */
      this.get('/doi/manuscript', (schema: any, request: any) => ({
        manuscripts: [
          {
            url: 'https://dash.harvard.edu/bitstream/1/12285462/1/Nanometer-Scale%20Thermometry.pdf',
            repositoryLabel: 'Harvard University - Digital Access to Scholarship at Harvard (DASH)',
            type: 'application/pdf',
            source: 'Unpaywall',
            name: 'Nanometer-Scale Thermometry.pdf',
          },
          {
            url: 'http://europepmc.org/articles/pmc4221854?pdf=render',
            repositoryLabel: 'pubmedcentral.nih.gov',
            type: 'application/pdf',
            source: 'Unpaywall',
            name: 'pmc4221854?pdf=render',
          },
          {
            url: 'http://arxiv.org/pdf/1304.1068',
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
      this.get('/file/:id', (schema: any, request: any) => schema.find('file', request.params.id));
      this.post('/file', function (this: any, schema: any, _request: any) {
        return {
          fileName: 'my-submission.pdf',
          mimeType: 'application/pdf',
          uuid: '12abc34xE999',
        };
      });
      this.delete('/file/:id/:name', function (this: any, schema: any, request: any) {
        return new Response(200);
      });
      // File API
      this.get('/data/file', (schema: any, request: any) => {
        console.log(`[MirageJS] GET /file | query ${JSON.stringify(request.queryParams)}`);
        return schema.none('file');
      });
      this.patch('/data/file/:id');
      this.post('/data/file', function (this: any, schema: any, _request: any) {
        const attrs = this.normalizedRequestAttrs();

        return schema.create('file', attrs);
      });
      this.delete('/data/file/:id', (_schema: any, _request: any) => {
        return new Response(204);
      });

      // Users
      this.get('/data/user/:id', (schema: any, request: any) => schema.find('user', request.params.id));
      this.get('/data/user', (schema: any, request: any) => schema.where('user', { displayName: 'Staff Hasgrants' }));

      // Journals
      this.get('/data/journal/:id', (schema: any, request: any) => schema.find('journal', request.params.id));
      // We could make it generic for the autocomplete service, but not much
      // reason just for tests
      this.get('/data/journal', (schema: any, request: any) => schema.where('journal', { journalName: 'The Analyst' }));

      // Policies
      this.get('/data/policy', (schema: any, request: any) => schema.all('policy'));
      this.get('/data/policy/:id', (schema: any, request: any) => schema.find('policy', request.params.id));

      // Funders
      this.get('/data/funder/:id', (schema: any, request: any) => schema.find('funder', request.params.id));

      // Repositories
      this.get('/data/repository', (schema: any, request: any) => schema.all('repository'));
      this.get('/data/repository/:id', (schema: any, request: any) => schema.find('repository', request.params.id));

      // Publications
      this.get('/data/publication/:id', (schema: any, request: any) => schema.find('publication', request.params.id));
      this.post('/data/publication', function (this: any, schema: any, request: any) {
        const attrs = this.normalizedRequestAttrs();
        return schema.create('publication', attrs);
      });
      this.patch('/data/publication/:id', function (this: any, schema: any, request: any) {
        const attrs = this.normalizedRequestAttrs('publication');
        return schema.find('publication', request.params.id).update(attrs);
      });

      // Submissions
      this.get('/data/submission/:id', (schema: any, request: any) => schema.find('submission', request.params.id));
      this.post('/data/submission', function (this: any, schema: any, request: any) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.create('submission', attrs);
      });
      this.patch('/data/submission/:id', function (this: any, schema: any, request: any) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.find('submission', request.params.id).update(attrs);
      });
      // Submission filtering
      this.get('/data/submission', function (this: any, schema: any, request: any) {
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
          let submissionFilter = Object.keys(query)
            .filter((key: string) => key.includes('filter[submission]'))
            .map((key: string) => query[key]);
          if (!Array.isArray(submissionFilter) || submissionFilter.length !== 1) {
            result = schema.none('submission');
          } else {
            // Once we know query params includes a submission filter, get its value
            submissionFilter = submissionFilter[0];
            result = submissionFilter.includes('cancelled') ? schema.all('submission') : schema.none('submission');
          }
        }

        // this.serialize() auto-sideloads via the submission serializer's include config
        const serialized = this.serialize(result);
        const pageSize = parseInt(query?.['page[size]'] || '10', 10);
        const pageNumber = parseInt(query?.['page[number]'] || '1', 10);
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
      this.post('/data/submissionEvent', function (this: any, schema: any, request: any) {
        const attrs = this.normalizedRequestAttrs('submission-event');
        const se = schema.create('submission-event', attrs);

        try {
          const submission = schema.find('submission', attrs.submissionId);
          submission.submissionStatus =
            attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
          submission.save();
        } catch (e) {
          console.log(e);
        }

        return se;
      });
      this.get('/data/submissionEvent/:id', (schema: any, request: any) =>
        schema.find('submission-event', request.params.id),
      );
      this.get('/data/submissionEvent', (schema: any, request: any) => schema.none('submission-event'));

      // Grants
      this.get('/data/grant/:id', (schema: any, request: any) => schema.find('grant', request.params.id));
      this.get('/data/grant', function (this: any, schema: any, request: any) {
        const grantsModel = schema.grant.all();
        const grants = this.serialize(grantsModel);
        const allData = grants.data || [];
        const totalRecords = allData.length;
        const pageSize = parseInt(request.queryParams['page[size]'] || '10', 10);
        const pageNumber = parseInt(request.queryParams['page[number]'] || '1', 10);
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

      this.get('/data/repositoryCopy/:id', (schema: any, request: any) =>
        schema.find('repository-copy', request.params.id),
      );
      this.get('/data/repositoryCopy', (schema: any, request: any) => schema.none('repository-copy'));

      this.get('/data/deposit/:id', (schema: any, request: any) => schema.find('deposit', request.params.id));
      this.get('/data/deposit', (schema: any, request: any) => schema.none('deposit'));

      /** DOI Service */
      this.get('/doi/journal', (schema: any, request: any) => {
        console.log(`[MirageJS] GET /journal | query: ${JSON.stringify(request.queryParams)}`);
        return {
          'journal-id': doiJournals['journal-id'],
          crossref: doiJournals.crossref,
        };
      });

      /** Policy Service */
      this.get('/policy/policies', async (schema: any, request: any) => {
        const { id } = schema.policy.findBy({ title: 'Johns Hopkins University (JHU) Open Access Policy' });
        const policies = [{ id, type: 'institution' }];
        const seenIds = new Set([id]);

        schema.submission.find(request.queryParams.submission).grants.models.forEach((grant: any) => {
          const { policyId } = schema.funder.find(grant.primaryFunder.id);
          const { id } = schema.policy.find(policyId);

          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            policies.push({ id, type: 'funder' });
          }
        });

        return policies;
      });
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policy/repositories', async (schema: any, request: any) => {
        const submissionId = request.queryParams.submission;
        const publicationId = schema.submission.find(submissionId).attrs.publicationId;
        const publication = schema.publication.find(publicationId);

        const j10p = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'jscholarship' });
        const pmc = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'pmc' });

        const payload: any = {
          required: [],
          'one-of': [[{ url: j10p.id, selected: true }]],
          optional: [{ url: j10p.id, selected: true }],
        };

        if (publication.journalId) {
          payload.required.push({ url: pmc.id, selected: false });
          payload['one-of'][0].push({ url: pmc.id, selected: false });
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
  });

  return server;
}
