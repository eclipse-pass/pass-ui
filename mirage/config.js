import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer } from 'miragejs';
import schemas from './routes/schemas';

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes() {
      /** Schema Service */
      schemas(this);

      /** DOI Service */
      this.get('/doiservice/journal', (schema, request) => {
        let journals = schema.journals.all();
        let journal = journals.models.find((journal) => journal.attrs.crossref.message.DOI === request.queryParams.doi);
        return {
          'journal-id': journal['journal-id'],
          crossref: journal.crossref,
        };
      });

      /** Policy Service */
      this.get('/policyservice/policies', () => [
        { id: '33', type: 'funder' },
        { id: '26', type: 'institution' },
      ]);
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policyservice/repositories', () => ({
        required: [{ 'repository-id': '19', selected: false }],
        'one-of': [
          [
            { 'repository-id': '19', selected: false },
            { 'repository-id': '18', selected: true },
          ],
        ],
        optional: [{ 'repository-id': '18', selected: true }],
      }));

      /** User Service */
      this.get('/pass-user-service/whoami', (schema, request) => {
        const userId = request.queryParams.userToken;
        // const users = schema.user.all();
        return schema.users.find(userId);
      });

      this.passthrough('http://localhost:8080/*');
      this.passthrough();
      // this.namespace = '/api/v1';
      /**
       * TODO: will I need to do something weird with the pluralization junk
       * that Mirage likes to do? Since our endpoints are not plural, but
       * just the model name
       *
       * TODO: need to mock searching?
       */

      // // Users
      // this.get('/*', (schema) => schema.users.find(id));

      // // Journals
      // this.get('/journal/:id', (schema) => schema.journals.find(id));

      // // Policies
      // this.get('/policy/:id', (schema) => schema.policies.find(id));

      // // Funders
      // this.get('/funder/:id', (schema) => schema.funders.find(id));

      // // Repositories
      // this.get('/repository/:id', (schema) => schema.repositories.find(id));

      // // Publications
      // this.get('/publication/:id', (schema) => schema.publications.find(id));
      // this.post('/publication', (schema, request) => {

      // });
      // this.patch('/publication/:id', 'publication');

      // // Submissions
      // this.get('/submission/:id');
      // this.post('/submission/:id', 'submission');
      // this.patch('/submission/:id', 'submission');

      // // Submission Events
      // this.get('/submissionEvent/:id');
      // this.post('/submissionEvent/:id', 'submissionEvent');

      // // Files
      // this.post(
      //   '/file',
      //   () =>
      //     new Response(201, {
      //       Location: 'https://pass.local/file/123456',
      //       'Content-Type': 'text/plain; charset=utf-8',
      //     })
      // );
      // this.patch('/file/:id', () => new Response(204));

      // // Grants
      // this.get('/grant/:id');
    },
  };

  return createServer(finalConfig);
}
