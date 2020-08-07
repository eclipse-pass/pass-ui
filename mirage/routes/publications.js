import { Response } from 'miragejs';
import uuid from './fedora-uuid-generator';

export default function (server) {
  /**
   * Mock the response from fcrepo for creating a publication
   */
  server.post('http://localhost:8080/fcrepo/rest/publications', (_schema, request) => {
    const attrs = JSON.parse(request.requestBody);

    attrs['@id'] = `https://pass.local/fcrepo/rest/publications/${uuid()}`;

    try {
      server.create('publication', {
        ...attrs,
        _source: attrs
      });
    } catch (e) {
      console.log(e);
    }

    return new Response(201, {
      Location: attrs['@id'],
      'Content-Type': 'text/plain; charset=UTF-8'
    });
  });

  /**
   * Mock the response from fcrepo for updating a publication
   */
  server.patch('https://pass.local/fcrepo/rest/publications/**', () => new Response(204));
}
