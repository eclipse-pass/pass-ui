// import { metaDataSchemas } from 'pass-ui/mirage/custom-fixtures/schemas';
import metaDataSchemas from '../custom-fixtures/schemas';

export default function (server) {
  server.get('/schema', (_schema, request) => {
    // if there are more than one repositories in the request body return the
    // the schema that includes PMC, otherwise return the schema without PMC
    let metaDataSchema;

    if (request.queryParams.entityIds.split(',').length > 1) {
      metaDataSchema = metaDataSchemas[0];
    } else {
      metaDataSchema = metaDataSchemas[1];
    }

    return [metaDataSchema];
  });
}
