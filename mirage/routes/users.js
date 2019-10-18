export default function (server) {
  /**
   * Mock user service response
   */
  server.get('https://pass.local:8080/pass-user-service/whoami', (schema, request) => {
    let response = schema.users.findBy({ '@id': request.queryParams.userToken });

    return response.attrs;
  });

  /**
   * Mock the response from fcrepo for a user
   */
  server.get('https://pass.local/fcrepo/rest/users/**', (schema, request) => {
    let response = schema.users.findBy({ '@id': request.url });

    return response.attrs;
  });
}
