export default function (server) {
  server.post('/schemaservice', (schema, request) => {
    // if there are more than one reponsitories in the request body return the
    // the schema that includes PMC, otherwise return the schema without PMC
    let metaDataSchema;

    if (JSON.parse(request.requestBody).length > 1) {
      metaDataSchema = schema.schemas.all().models[0].schema;
    } else {
      metaDataSchema = schema.schemas.all().models[1].schema;
    }

    return metaDataSchema;
  });
}
