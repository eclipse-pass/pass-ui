import { Response } from 'miragejs';

export default function (server) {
  /**
   * Mock the response from fcrepo for creating a submission
   */
  server.post('http://localhost:8080/fcrepo/rest/submissions', () => new Response(201, {
    Location: 'https://pass.local/fcrepo/rest/submissions/6a/e3/c0/91/6ae3c091-e87e-4249-a744-72cb93415a95',
    'Content-Type': 'text/plain; charset=UTF-8'
  }));

  /**
   * Mock the response from fcrepo for creating a submission
   */
  server.post('https://pass.local/fcrepo/rest/submissions/**', () => new Response(201, {
    Location: 'https://pass.local/fcrepo/rest/submissions/6a/e3/c0/91/6ae3c091-e87e-4249-a744-72cb93415a95',
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
