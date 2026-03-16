import metaDataSchemas from '../custom-fixtures/schemas';
import type { Server, Request } from 'miragejs';

export default function (server: Server) {
  server.get('/schema', (_schema, request) => {
    // if there are more than one repositories in the request body return the
    // the schema that includes PMC, otherwise return the schema without PMC
    let metaDataSchema;
    const entityIds = request.queryParams.entityIds as string | undefined;

    if (entityIds && entityIds.split(',').length > 1) {
      metaDataSchema = metaDataSchemas[0];
    } else {
      metaDataSchema = metaDataSchemas[1];
    }

    return [metaDataSchema];
  });
}
