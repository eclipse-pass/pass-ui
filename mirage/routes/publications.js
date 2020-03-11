import { Response } from 'miragejs';

export default function (server) {
  /**
   * Mock the response from fcrepo for creating a publication
   */
  server.post('http://localhost:8080/fcrepo/rest/publications', () => new Response(201, {
    Location: 'https://pass.local/fcrepo/rest/publications/4e/b8/8f/65/4eb88f65-35d0-4644-a146-285ccbae2291',
    'Content-Type': 'text/plain; charset=UTF-8'
  }));

  /**
   * Mock the response from fcrepo for updating a publication
   */
  server.patch('https://pass.local/fcrepo/rest/publications/**', () => new Response(204));
}
