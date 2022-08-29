import { discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer } from 'miragejs';
import schemas from './routes/schemas';
import ENV from 'pass-ui/config/environment';

export default function (config) {
  this.urlPrefix = ENV.host;

  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    routes() {
      /**
       * TODO: will I need to do something weird with the pluralization junk
       * that Mirage likes to do? Since our endpoints are not plural, but
       * just the model name
       *
       * TODO: need to mock searching?
       */

      // Users
      this.get('/user/:id');

      // Journals
      this.get('/journal/:id');

      // Policies
      this.get('/policy/:id');

      // Funders
      this.get('/funder/:id');

      // Repositories
      this.get('/repository/:id');

      // Publications
      this.get('/publication/:id');
      this.post('/publication/:id', 'publication');
      this.patch('/publication/:id', 'publication');

      // Submissions
      this.get('/submission/:id');
      this.post('/submission/:id', 'submission');
      this.patch('/submission/:id', 'submission');

      // Submission Events
      this.get('/submissionEvent/:id');
      this.post('/submissionEvent/:id', 'submissionEvent');

      // Files
      this.post(
        '/file',
        () =>
          new Response(201, {
            Location: 'https://pass.local/file/123456',
            'Content-Type': 'text/plain; charset=utf-8',
          })
      );
      this.patch('/file/:id', () => new Response(204));

      // Grants
      this.get('/grant/:id');

      /**
       * Schema Service
       */
      schemas(this);

      /**
       * DOI Service
       */
      this.get('/doiservice/journal', (schema, request) => {
        let journals = schema.journals.all();
        let journal = journals.models.find((journal) => journal.attrs.crossref.message.DOI === request.queryParams.doi);
        return {
          'journal-id': journal['journal-id'],
          crossref: journal.crossref,
        };
      });

      /**
       * Policy Service
       */
      this.get('/policyservice/policies', () => [
        { id: '5', type: 'funder' },
        { id: '0', type: 'institution' },
      ]);
      // Return NIH (required) and J10p (optional, selected)
      this.get('/policyservice/repositories', () => ({
        required: [{ 'repository-id': '3', selected: false }],
        'one-of': [
          [
            { 'repository-id': '3', selected: false },
            { 'repository-id': '1', selected: true },
          ],
        ],
        optional: [{ 'repository-id': '1', selected: true }],
      }));

      /**
       * User Service
       */
      this.get('/pass-user-service/whoami', (schema, request) => {
        if (!userId) {
          userId = request.queryParams.userToken;
        }
        return schema.users.find(userId);
      });
    },
  };

  return createServer(finalConfig);
}
