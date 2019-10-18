export default function (server) {
  server.post('https://pass.local/schemaservice', (schema, _request) => {
    return schema.schemas.all().models[0].schema;
  });
}
