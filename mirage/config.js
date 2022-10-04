import { discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer, JSONAPISerializer } from 'miragejs';
import schemas from './routes/schemas';

export default function (config) {
  let finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    serializers: {
      application: JSONAPISerializer,
    },
    logging: true,
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
      this.get('/user/:id', (schema) => schema.users.find(request.params.id));

      // Journals
      this.get('/journal/:id', (schema) => schema.journals.find(request.params.id));

      // Policies
      this.get('/policy/:id', (schema) => schema.policies.find(request.params.id));

      // Funders
      this.get('/funder/:id', (schema) => schema.funders.find(request.params.id));

      // Repositories
      this.get('/repository/:id', (schema) => schema.repositories.find(request.params.id));

      // Publications
      this.get('/publication/:id', (schema) => schema.publications.find(request.params.id));
      this.post('/publication', (schema, request) => schema.publications.create(this.normalizedRequestAttrs()));
      this.patch('/publication/:id', (schema, request) =>
        schema.publications.find(request.params.id).update(this.normalizedRequestAttrs())
      );

      // Submissions
      this.get('/submission/:id', (schema) => schema.submissions.find(request.params.id));
      this.post('/submission/:id', (schema) => schema.submissions.create(this.normalizedRequestAttrs()));
      this.patch('/submission/:id', (schema, req) =>
        schema.submissions.find(req.params.id).update(this.normalizedRequestAttrs())
      );

      // Submission Events
      this.get('/submissionEvent/:id', (schema) => schema.submissionEvents.find(request.params.id));
      this.post('/submissionEvent/:id', (schema) => schema.submissionEvents.create(this.normalizedRequestAttrs()));

      // Grants
      this.get('/grant/:id', (schema) => schema.grants.find(request.params.id));

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
