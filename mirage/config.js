export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  this.urlPrefix = 'http://localhost:8000';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
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
  this.post('/api-auth-token/', (schema, request) => {
    return {token: 'f1e0e452b7ed034bdbd6bdcb877228d1d1c0c030'};
  });
  this.get('/users/me', (schema, request) => {
    return schema.users.find(1);
  });

  this.get('/deposits');
  this.post('/deposits');
  this.get('/deposits/:id');
  this.patch('/deposits/:id'); // or this.patch
  this.del('/deposits/:id');

  this.get('/files');
  this.post('/files');
  this.get('/files/:id');
  this.patch('/files/:id'); // or this.patch
  this.del('/files/:id');

  this.get('/funders');
  this.post('/funders');
  this.get('/funders/:id');
  this.patch('/funders/:id'); // or this.patch
  this.del('/funders/:id');

  this.get('/grants');
  this.post('/grants');
  this.get('/grants/:id');
  this.patch('/grants/:id'); // or this.patch
  this.del('/grants/:id');

  this.get('/journals');
  this.post('/journals');
  this.get('/journals/:id');
  this.patch('/journals/:id'); // or this.patch
  this.del('/journals/:id');

  this.get('/people');
  this.post('/people');
  this.get('/people/:id');
  this.patch('/people/:id'); // or this.patch
  this.del('/people/:id');

  this.get('/policies');
  this.post('/policies');
  this.get('/policies/:id');
  this.patch('/policies/:id'); // or this.patch
  this.del('/policies/:id');

  this.get('/repositories');
  this.post('/repositories');
  this.get('/repositories/:id');
  this.patch('/repositories/:id'); // or this.patch
  this.del('/repositories/:id');

  this.get('/submissions');
  this.post('/submissions');
  this.get('/submissions/:id');
  this.patch('/submissions/:id'); // or this.patch
  this.del('/submissions/:id');

  this.get('/users');
  this.post('/users');
  this.get('/users/:id');
  this.patch('/users/:id'); // or this.patch
  this.del('/users/:id');

  this.passthrough();
}
