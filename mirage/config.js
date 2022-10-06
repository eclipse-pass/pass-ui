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

      // // Files
      this.post(
        '/file',
        () =>
          new Response(201, {
            Location: 'https://pass.local/api/v1/file/123456',
            'Content-Type': 'text/plain; charset=utf-8',
          })
      );
      this.patch('/file/:id', () => new Response(204));

      /**
       * ################################################################
       * ##### Only capture data requests using /mirage/test path #######
       * ################################################################
       */
      this.namespace = '/mirage/test';
      /**
       * Note we're explicitly NOT using MirageJS shorthands for our route handling
       * because of the mismatch between the pluralized Mirage DB tables and
       * the non-plural routes
       *
       * TODO: will I need to do something weird with the pluralization junk
       * that Mirage likes to do? Since our endpoints are not plural, but
       * just the model name
       *
       * TODO: need to mock searching?
       */

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
        /**
         * JSON object with query parameter as key, value as value.
         * ex: ?param1=value1&param2=value2
         * { param1: value1, param2: value2 }
         */
        // const query = request.queryParams;

        // if (!query) {
        //   return schema.submission.all();
        // }

        // // Find the 'filter[...]' parameter
        // let submissionFilter = Object.keys(query)
        //   .filter(key => key.includes('filter[submission]'))
        //   .map(key => query[key]);
        // if (!Array.isArray(submissionFilter) || submissionFilter.length !== 1) {
        //   return schema.submission.none();
        // }
        // // Once we know query params includes a submission filter, get its value
        // submissionFilter = submissionFilter[0];
        // console.log(`[MirageJS] /submission filter: '${submissionFilter}'`);
        console.log(`[MirageJS] GET /submission | query: ${JSON.stringify(request.queryParams)}`);
        return schema.submission.none();
      });

      // Submission Events
      this.post('/submissionEvent', 'submissionEvent');
      this.get('/submissionEvent/:id', 'submissionEvent');
      this.get('/submissionEvent', (schema, request) => {
        console.log(`[MirageJS] GET /submissionEvent | query: ${JSON.stringify(request.queryParams)}`);
        return schema.submissionEvent.none();
      });

      // Grants
      this.get('/grant/:id', 'grant');
      this.get('/grant', (schema, request) => {
        console.log(`[MirageJS] GET /grant | query: ${JSON.stringify(request.queryParams)}`);
        return schema.grant.all();
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
