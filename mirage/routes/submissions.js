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
      _source: attrs
    });

    return new Response(201, {
      Location: attrs['@id'],
      'Content-Type': 'text/plain; charset=UTF-8'
    });
  });

  /**
   * Mock the response from fcrepo for creating a submission
   */
  server.post('https://pass.local/fcrepo/rest/submissions/**', (_schema, request) => new Response(201, {
    Location: request.responseURL,
    'Content-Type': 'text/plain; charset=UTF-8'
  }));

  /**
   * Mock the response from fcrepo for updating a submission
   */
  server.patch('https://pass.local/fcrepo/rest/submissions/**', () => new Response(204));

  /**
   * Mock the response from fcrepo for creating a submission event
   */
  server.post('http://localhost:8080/fcrepo/rest/submissionEvents', () => new Response(201, {
    Location: 'https://pass.local/fcrepo/rest/submissionEvents/9e/bb/b4/16/9ebbb416-04a1-4c21-9a40-331624ee1e77',
    'Content-Type': 'text/plain; charset=UTF-8'
  }));
}
