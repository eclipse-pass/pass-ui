import { camelize } from '@ember/string';
import { discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer, JSONAPISerializer } from 'miragejs';
import doiJournals from './custom-fixtures/nih-submission/doi-journals';
import schemas from './routes/schemas';

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    serializers: {
      application: JSONAPISerializer.extend({
        keyForAttribute: (attr) => (attr ? camelize(attr) : null),
        keyForRelationship: (key) => (key ? camelize(key) : null),
      }),
      policy: JSONAPISerializer.extend({
        // include: ['repositories']
        alwaysIncludeLinkageData: true,
      }),
    },
    routes() {
      /** Schema Service */
      schemas(this);

      /** DOI Service */
      this.get('/doiservice/journal', (schema, request) => {
        console.log(`[MirageJS] GET /doiservice/journal | query: ${JSON.stringify(request.queryParams)}`);
        return {
          'journal-id': doiJournals['journal-id'],
          crossref: doiJournals.crossref,
        };
      });

      /** Policy Service */
      this.get('/policyservice/policies', (schema, request) => {
        const institutionPolicy = schema.policy.findBy({
          title: 'Johns Hopkins University (JHU) Open Access Policy',
        });
        const nihPolicy = schema.policy.findBy({
          title: 'National Institutes of Health Public Access Policy',
        });

        return [
          { id: nihPolicy.id, type: 'funder' },
          { id: institutionPolicy.id, type: 'institution' },
        ];
      });
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policyservice/repositories', (schema, request) => {
        const j10p = schema.repository.findBy({ repositoryKey: 'jscholarship' });
        const pmc = schema.repository.findBy({ repositoryKey: 'pmc' });

        return {
          required: [{ 'repository-id': pmc.id, selected: false }],
          'one-of': [
            [
              { 'repository-id': pmc.id, selected: false },
              { 'repository-id': j10p.id, selected: true },
            ],
          ],
          optional: [{ 'repository-id': j10p.id, selected: true }],
        };
      });

      /** User Service */
      this.get('/pass-user-service/whoami', (schema, request) => {
        const userId = request.queryParams.userToken;
        // const users = schema.user.all();
        return schema.users.find(userId);
      });

      /** Download service */
      this.get('/downloadservice/lookup', (schema, request) => ({
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
       * ##### Only capture data requests using /mirage/test path #######
       * ################################################################
       */
      this.namespace = '/mirage/test';

      // Files
      this.get('/file/:id', 'file');
      this.get('/file/:id/data', (schema, request) => {
        console.log(`[MirageJS] GET /file/${request.params.id}/data`);
        return new Response(200, {
          'Content-Type': 'application/octet-stream',
        });
      });
      this.post('/file', 'file');
      this.patch('/file/:id', () => new Response(204));

      // Users
      this.get('/user/:id', 'user');

      // Journals
      this.get('/journal/:id', 'journal');

      // Policies
      this.get('/policy', (schema, request) => {
        console.log(`[MirageJS] GET /policy | query: ${JSON.stringify(request.queryParams)}`);
        return schema.policy.all();
      });
      // this.get('/policy', 'policy');
      this.get('/policy/:id', 'policy');

      // Funders
      this.get('/funder/:id', 'funder');

      // Repositories
      this.get('/repository', (schema, request) => {
        console.log(`[MirageJS] GET /repository | query: ${JSON.stringify(request.queryParams)}`);
        return schema.repository.all();
      });
      this.get('/repository/:id', 'repository');

      // Publications
      this.get('/publication/:id', 'publication');
      this.post('/publication', 'publication');
      this.patch('/publication/:id', 'publication');

      // Submissions
      this.get('/submission/:id', 'submission');
      this.post('/submission', 'submission');
      this.patch('/submission/:id', 'submission');
      // Submission filtering
      this.get('/submission', (schema, request) => {
        console.log(`[MirageJS] GET /submission | query: ${JSON.stringify(request.queryParams)}`);
        /**
         * JSON object with query parameter as key, value as value.
         * ex: ?param1=value1&param2=value2
         * { param1: value1, param2: value2 }
         */
        const query = request.queryParams;

        if (!query) {
          return schema.submission.all();
        }

        // Find the 'filter[...]' parameter
        let submissionFilter = Object.keys(query)
          .filter((key) => key.includes('filter[submission]'))
          .map((key) => query[key]);
        if (!Array.isArray(submissionFilter) || submissionFilter.length !== 1) {
          return schema.submission.none();
        }
        // Once we know query params includes a submission filter, get its value
        submissionFilter = submissionFilter[0];

        if (submissionFilter.includes('cancelled')) {
          return schema.submission.all();
        }

        return schema.submission.none();
      });

      // Submission Events
      this.post('/submissionEvent', function (schema, request) {
        const attrs = this.normalizedRequestAttrs();
        const se = schema.submissionEvents.create(attrs);

        try {
          const submission = schema.submission.find(attrs.submissionId);
          submission.submissionStatus =
            attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
          submission.submissionStatus =
            attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
          submission.save();
        } catch (e) {
          console.log(e);
        }

        return se;
      });
      this.get('/submissionEvent/:id', (schema, request) => schema.submissionEvents.find(request.params.id));
      this.get('/submissionEvent', (schema, request) => {
        console.log(`[MirageJS] GET /submissionEvent | query: ${JSON.stringify(request.queryParams)}`);
        return schema.submissionEvents.none();
      });

      // Grants
      this.get('/grant/:id', 'grant');
      this.get('/grant', (schema, request) => {
        console.log(`[MirageJS] GET /grant | query: ${JSON.stringify(request.queryParams)}`);
        return schema.grant.all();
      });

      this.get('/repositoryCopy/:id', 'repositoryCopy');
      this.get('/repositoryCopy', (schema, request) => {
        return schema.repositoryCopies.none();
      });

      /**
       * ################################################################
       * ##### Pass through everything else #############################
       * ################################################################
       */
      this.passthrough('http://localhost/**');
      this.passthrough('https://localhost/**');
      this.passthrough();
    },
  };

  return createServer(finalConfig);
}
