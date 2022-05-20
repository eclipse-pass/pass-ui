export default function (server) {
  /**
   * Mock the response from the DOI service for getting a journal
   */
  server.get('https://pass.local/doiservice/journal', (schema, request) => {
    let journals = schema.journals.all();

    let journal = journals.models.find((journal) => journal.attrs.crossref.message.DOI === request.queryParams.doi);

    return {
      'journal-id': journal['journal-id'],
      crossref: journal.crossref,
    };
  });

  /**
   * Mock the response from fcrepo for getting a journal
   */
  server.get('https://pass.local/fcrepo/rest/journals/**/', (schema, request) => {
    let response = schema.journals.findBy({ '@id': request.url });

    return response.attrs;
  });
}
