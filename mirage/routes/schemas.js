export default function (server) {
  server.get('/schema', (schema, request) => {
    // if there are more than one repositories in the request body return the
    // the schema that includes PMC, otherwise return the schema without PMC
    let metaDataSchema;
    if (request.queryParams.entityIds.split(',').length > 1) {
      metaDataSchema = schema.schemas.all().models[0];
    } else {
      metaDataSchema = schema.schemas.all().models[1];
    }

    return [metaDataSchema.attrs];
  });
}
