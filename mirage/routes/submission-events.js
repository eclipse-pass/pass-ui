import { Response } from 'miragejs';
import uuid from './fedora-uuid-generator';

export default function (server) {
  /**
   * Mock the response from fcrepo for creating a submission event
   */
  server.post('http://localhost:8080/fcrepo/rest/submissionEvents', (_schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    attrs['@id'] = `https://pass.local/fcrepo/rest/submissionEvents/${uuid()}`;
    try {
      const submission = _schema.submissions.findBy({ '@id': attrs.submission });
      submission.submissionStatus =
        attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
      submission._source.submissionStatus =
        attrs.eventType === 'approval-requested-newuser' ? 'approval-requested' : attrs.eventType;
      submission.save();
    } catch (e) {
      console.log(e);
    }

    return new Response(201, {
      Location: attrs['@id'],
      'Content-Type': 'text/plain; charset=UTF-8',
    });
  });
}
