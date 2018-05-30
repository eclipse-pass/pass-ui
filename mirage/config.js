import ENV from 'pass-ember/config/environment';

export default function () {
  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  this.urlPrefix = ENV.host; // make this `http://localhost:8080`, for example, if your API is on a different server
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
  this.passthrough();
  this.passthrough(`${ENV.fedora.base}**`);
  // Separate passthrough because search is done on a different port
  this.passthrough(ENV.fedora.elasticsearch); // Default will be something like: http://localhost:9200/pass/_search
  this.post('http://localhost:9999/api-auth-token/', (schema, request) => ({ token: 'f1e0e452b7ed034bdbd6bdcb877228d1d1c0c030' }));
}

export function testConfig() {
  // test-only config, does not apply to development
  // this.post('/api-auth-token/', (schema, request) => ({ token: 'f1e0e452b7ed034bdbd6bdcb877228d1d1c0c030' }));

  this.urlPrefix = ENV.host;
  this.passthrough();
  this.passthrough(`${ENV.fedora.base}**`);
  // // Separate passthrough because search is done on a different port
  this.passthrough(ENV.fedora.elasticsearch); // Default will be something like: http://localhost:9200/pass/_search

  // Mock user service response, looks for username 'hvu' and returns it as JSON data
  this.get(ENV.userService.url, (schema, request) => { // eslint-disable-line
    let moo = $.ajax({
      url: `${ENV.fedora.elasticsearch}?q=@type:User&from=0&size=100`,
      method: 'GET',
      dataType: 'json',
      headers: {
        Accept: 'application/json; charset=utf-8'
      },
    }).then((resp) => {
      let moo1 = resp.hits.hits.filter(match => match._source.username === 'hvu');
      if (moo1.length > 0) {
        return moo1[0]._source;
      }
    });
    return moo;
  });
}
