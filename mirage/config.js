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
        alwaysIncludeLinkageData: true,
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
        const institutionPolicy = schema.findBy('policy', {
          title: 'Johns Hopkins University (JHU) Open Access Policy',
        });
        const nihPolicy = schema.findBy('policy', {
          title: 'National Institutes of Health Public Access Policy',
        });

        return [
          { id: nihPolicy.id, type: 'funder' },
          { id: institutionPolicy.id, type: 'institution' },
        ];
      });
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policyservice/repositories', (schema, request) => {
        const j10p = schema.findBy('repository', { repositoryKey: 'jscholarship' });
        const pmc = schema.findBy('repository', { repositoryKey: 'pmc' });

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
        return schema.find('user', userId);
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

      // Files
      this.get('/file/:id', (schema, request) => schema.find('file', request.params.id));
      this.get(
        '/file/:id/data',
        (schema, request) =>
          new Response(200, {
            'Content-Type': 'application/octet-stream',
          })
      );
      this.get('/file', (schema, request) => {
        console.log(`[MirageJS] GET /file | query ${JSON.stringify(request.queryParams)}`);
        return schema.none('file');
      });
      this.post('/file', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('file');
        return schema.create('file', attrs);
      });
      this.patch('/file/:id', () => new Response(204));

      /**
       * ################################################################
       * ##### Only capture data requests using /mirage/test path #######
       * ################################################################
       */
      this.namespace = '/mirage/test';

      /**
       * Copy 'file' mocks in order to have the proper mocks using the `/mirage/test` namespace
       */
      // Files
      this.get('/file/:id', (schema, request) => schema.find('file', request.params.id));
      this.get(
        '/file/:id/data',
        (schema, request) =>
          new Response(200, {
            'Content-Type': 'application/octet-stream',
          })
      );
      this.get('/file', (schema, request) => {
        console.log(`[MirageJS] GET /file | query ${JSON.stringify(request.queryParams)}`);
        return schema.none('file');
      });
      this.post('/file', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('file');
        return schema.create('file', attrs);
      });
      this.patch('/file/:id', () => new Response(204));

      // Users
      this.get('/user/:id', (schema, request) => schema.find('user', request.params.id));
      this.get('/user', (schema, request) => schema.where('user', { displayName: 'Staff Hasgrants' }));

      // Journals
      this.get('/journal/:id', (schema, request) => schema.find('journal', request.params.id));
      // We could make it generic for the autocomplete service, but not much
      // reason just for tests
      this.get('/journal', (schema, request) => schema.where('journal', { journalName: 'The Analyst' }));

      // Policies
      this.get('/policy', (schema, request) => schema.all('policy'));
      this.get('/policy/:id', (schema, request) => schema.find('policy', request.params.id));

      // Funders
      this.get('/funder/:id', (schema, request) => schema.find('funder', request.params.id));

      // Repositories
      this.get('/repository', (schema, request) => schema.all('repository'));
      this.get('/repository/:id', (schema, request) => schema.find('repository', request.params.id));

      // Publications
      this.get('/publication/:id', (schema, request) => schema.find('publication', request.params.id));
      this.post('/publication', function (schema, request) {
        const attrs = this.normalizedRequestAttrs();
        return schema.create('publication', attrs);
      });
      this.patch('/publication/:id', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('publication');
        return schema.find('publication', request.params.id).update(attrs);
      });

      // Submissions
      this.get('/submission/:id', (schema, request) => schema.find('submission', request.params.id));
      this.post('/submission', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.create('submission', attrs);
      });
      this.patch('/submission/:id', function (schema, request) {
        const attrs = this.normalizedRequestAttrs('submission');
        return schema.find('submission', request.params.id).update(attrs);
      });
      // Submission filtering
      this.get('/submission', (schema, request) => {
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
      this.post('/submissionEvent', function (schema, request) {
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
      this.get('/submissionEvent/:id', (schema, request) => schema.find('submission-event', request.params.id));
      this.get('/submissionEvent', (schema, request) => schema.none('submission-event'));

      // Grants
      this.get('/grant/:id', (schema, request) => schema.find('grant', request.params.id));
      this.get('/grant', (schema, request) => schema.all('grant'));

      this.get('/repositoryCopy/:id', (schema, request) => schema.find('repositoryCopy', request.params.id));
      this.get('/repositoryCopy', (schema, request) => schema.none('repositoryCopy'));

      this.get('/deposit/:id', (schema, request) => schema.find('deposit', request.params.id));
      this.get('/deposit', (schema, request) => schema.none('deposit'));

      /**
       * ################################################################
       * ##### Pass through everything else #############################
       * ################################################################
       */
      this.passthrough('http://localhost/**');
      this.passthrough('https://localhost/**');

      this.passthrough('http://pass.local/**');
      this.passthrough('https://pass.local/**');

      this.passthrough();
    },
  };

  return createServer(finalConfig);
}
