export default function (server) {
  server.post('https://pass.local/schemaservice', (schema, _request) => schema.schemas.all().models[0].schema);
}
