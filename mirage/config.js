import ENV from 'pass-ember/config/environment';

export default function () {
  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  this.urlPrefix = 'http://localhost:8080'; // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '/fcrepo/rest';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */
  this.post('/api-auth-token/', (schema, request) => ({ token: 'f1e0e452b7ed034bdbd6bdcb877228d1d1c0c030' }));
  this.get('/users/me', (schema, request) => schema.users.find(1));

  this.get('/users');
  this.post('/users');
  this.get('/users/:id');
  this.patch('/users/:id'); // or this.patch
  this.del('/users/:id');

  this.passthrough();
  this.passthrough('http://localhost:9200/pass', 'http://localhost:9200/pass/_search');
}
