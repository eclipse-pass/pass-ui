import { Response } from 'miragejs';
import uuid from './fedora-uuid-generator';

export default function (server) {
  /**
   * Mock the response from fcrepo for creating a submission
   */
  server.post('http://localhost:8080/fcrepo/rest/submissions', (_schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    attrs['@id'] = `https://pass.local/fcrepo/rest/submissions/${uuid()}`;

    server.create('submission', {
      ...attrs,
      _source: attrs,
    });

    return new Response(201, {
      Location: attrs['@id'],
      'Content-Type': 'text/plain; charset=UTF-8',
    });
  });

  /**
   * Mock the response from fcrepo for creating a submission
   */
  server.post(
    'https://pass.local/fcrepo/rest/submissions/**',
    (_schema, request) =>
      new Response(201, {
        Location: request.responseURL,
        'Content-Type': 'text/plain; charset=UTF-8',
      })
  );

  /**
   * Mock the response from fcrepo for updating a submission
   */
  server.patch('https://pass.local/fcrepo/rest/submissions/**', () => new Response(204));

  /**
   * Mock the response from fcrepo for getting a submission
   */
  server.get('https://pass.local/fcrepo/rest/submissions/**', (schema, request) => {
    let submission;

    try {
      submission = schema.submissions.findBy({ '@id': request.responseURL });
    } catch (e) {
      console.log(e);
    }

    return new Response(200, {}, JSON.stringify(submission));
  });
}
