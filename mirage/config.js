import { camelize } from '@ember/string';
import { discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer, JSONAPISerializer, Response } from 'miragejs';
import doiJournals from './custom-fixtures/nih-submission/doi-journals';
import schemas from './routes/schemas';
import ENV from 'pass-ui/config/environment';
import MockDataFinder from './service-handler';

export default function (config) {
  const dataFinder = new MockDataFinder(ENV.environment);

  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    serializers: {
      application: JSONAPISerializer.extend({
        keyForAttribute: (attr) => (attr ? camelize(attr) : null),
        keyForRelationship: (key) => (key ? camelize(key) : null),
        alwaysIncludeLinkageData: true,
      }),
      policy: JSONAPISerializer.extend({
        // include: ['repositories']
        alwaysIncludeLinkageData: true,
      }),
    },
    routes() {
      this.get('/app/config.json', (_schema, _request) => {
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

      /** Auth Service  */
      this.get('/authenticated', (schema, request) => {
        const user = schema.find('user', 0);

        return {
          user: {
            id: user.id,
          },
        };
      });

      /** User Service */
      this.get('/pass-user-service/whoami', (schema, request) => {
        const userId = request.queryParams.userToken;
        return schema.find('user', userId);
      });

      /** Download service */
      this.get('/doi/manuscript', (schema, request) => ({
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
      this.get('/file/:id', (schema, request) => schema.find('file', request.params.id));
      this.post('/file', function (schema, _request) {
        return {
          fileName: 'my-submission.pdf',
          mimeType: 'application/pdf',
          uuid: '12abc34xE999',
        };
      });
      // File API
      this.get('/data/file', (schema, request) => {
        console.log(`[MirageJS] GET /file | query ${JSON.stringify(request.queryParams)}`);
        return schema.none('file');
      });
      this.patch('/data/file/:id');
      this.post('/data/file', function (schema, _request) {
        const attrs = this.normalizedRequestAttrs();

        return schema.create('file', attrs);
      });
      this.delete('/data/file/:id/:name', (_schema, _request) => {
        return new Response(200);
      });

      /** Schema Service */
      schemas(this);

      // Users
      this.get('/data/user/:id', (schema, request) => schema.find('user', request.params.id));
      this.get('/data/user', (schema, request) => schema.where('user', { displayName: 'Staff Hasgrants' }));

      // Journals
      this.get('/data/journal/:id', (schema, request) => schema.find('journal', request.params.id));
      // We could make it generic for the autocomplete service, but not much
      // reason just for tests
      this.get('/data/journal', (schema, request) => schema.where('journal', { journalName: 'The Analyst' }));

      // Policies
      this.get('/data/policy', (schema, request) => schema.all('policy'));
      this.get('/data/policy/:id', (schema, request) => schema.find('policy', request.params.id));

      // Funders
      this.get('/data/funder/:id', (schema, request) => schema.find('funder', request.params.id));

      // Repositories
      this.get('/data/repository', (schema, request) => schema.all('repository'));
      this.get('/data/repository/:id', (schema, request) => schema.find('repository', request.params.id));

      // Publications
      this.get('/data/publication/:id', (schema, request) => schema.find('publication', request.params.id));
      this.post('/data/publication', function (schema, request) {
        const attrs = this.normalizedRequestAttrs();
        return schema.create('publication', attrs);
      });
      this.patch('/data/publication/:id', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('publication');
        return schema.find('publication', request.params.id).update(attrs);
      });

      // Submissions
      this.get('/data/submission/:id', (schema, request) => schema.find('submission', request.params.id));
      this.post('/data/submission', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.create('submission', attrs);
      });
      this.patch('/data/submission/:id', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.find('submission', request.params.id).update(attrs);
      });
      // Submission filtering
      this.get('/data/submission', (schema, request) => {
        /**
         * JSON object with query parameter as key, value as value.
         * ex: ?param1=value1&param2=value2
         * { param1: value1, param2: value2 }
         */
        const query = request.queryParams;

        if (!query) {
          return schema.all('submission');
        }

        // Find the 'filter[...]' parameter
        let submissionFilter = Object.keys(query)
          .filter((key) => key.includes('filter[submission]'))
          .map((key) => query[key]);
        if (!Array.isArray(submissionFilter) || submissionFilter.length !== 1) {
          return schema.none('submission');
        }
        // Once we know query params includes a submission filter, get its value
        submissionFilter = submissionFilter[0];

        if (submissionFilter.includes('cancelled')) {
          return schema.all('submission');
        }

        return schema.none('submission');
      });

      // Submission Events
      this.post('/data/submissionEvent', function (schema, request) {
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
      this.get('/data/submissionEvent/:id', (schema, request) => schema.find('submission-event', request.params.id));
      this.get('/data/submissionEvent', (schema, request) => schema.none('submission-event'));

      // Grants
      this.get('/data/grant/:id', (schema, request) => schema.find('grant', request.params.id));
      this.get('/data/grant', (schema, request) => schema.all('grant'));

      this.get('/data/repositoryCopy/:id', (schema, request) => schema.find('repositoryCopy', request.params.id));
      this.get('/data/repositoryCopy', (schema, request) => schema.none('repositoryCopy'));

      this.get('/data/deposit/:id', (schema, request) => schema.find('deposit', request.params.id));
      this.get('/data/deposit', (schema, request) => schema.none('deposit'));

      /** DOI Service */
      this.get('/doi/journal', (schema, request) => {
        console.log(`[MirageJS] GET /journal | query: ${JSON.stringify(request.queryParams)}`);
        return {
          'journal-id': doiJournals['journal-id'],
          crossref: doiJournals.crossref,
        };
      });

      /** Policy Service */
      this.get('/policy/policies', async (schema, request) => {
        const { id } = schema.policy.findBy({ title: 'Johns Hopkins University (JHU) Open Access Policy' });
        const policies = [{ id, type: 'institution' }];

        schema.submission.find(request.queryParams.submission).grants.models.forEach((grant) => {
          const { policyId } = schema.funder.find(grant.primaryFunder.id);
          const { id } = schema.policy.find(policyId);

          if (id) policies.push({ id, type: 'funder' });
        });

        return policies;
      });
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policy/repositories', async (schema, request) => {
        const submissionId = request.queryParams.submission;
        const publicationId = schema.submission.find(submissionId).attrs.publicationId;
        const publication = schema.publication.find(publicationId);

        const j10p = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'jscholarship' });
        const pmc = await dataFinder.findBy(schema, 'repository', { repositoryKey: 'pmc' });

        const payload = {
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

  server.create('journal', {
    id: '10',
    issns: ['Print:0003-2654', 'Online:1364-5528'],
    journalName: 'The Analyst',
    nlmta: 'Analyst',
    pmcParticipation: 'B',
  });

  server.loadFixtures();

  return server;
}
