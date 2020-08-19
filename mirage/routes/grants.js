export default function (server) {
  /**
   * Mock the response from fcrepo for getting a policy
   */
  server.get('https://pass.local/fcrepo/rest/grants/**', (schema, request) => {
    let grant;

    let grants = schema.grants.all();
    grant = grants.models.find(grant => grant.attrs._source['@id'] === request.url);

    return grant.attrs._source;
  });
}
