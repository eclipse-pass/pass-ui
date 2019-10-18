export default function (server) {
  /**
   * Mock the response from fcrepo for getting a funder
   */
  server.get('https://pass.local/fcrepo/rest/funders/**/', (schema, request) => {
    let response = schema.funders.findBy({ '@id': request.url });

    return response.attrs;
  });
}
