export default function (server) {
  /**
   * Mock the response from fcrepo for getting a repository
   */
  server.get('https://pass.local/fcrepo/rest/repositories/**/', (schema, request) => {
    let repositories = schema.repositories.all();
    let repository = repositories.models.find(repository => repository.attrs._source['@id'] === request.url);

    return repository.attrs._source;
  });
}
