/**
 * Note use of custom fixtures directory. This needs to happen because
 * Mirage maps the fixtures directory and will not allow mismatches between
 * Mirage model names and fixture files and also will not allow sub-directories.
 * This means these files are not Mirage fixtures and cannot be used with the
 * Mirage loadFixtures() method so we combine their use with factories instead.
 */
import metaDataSchema from '../custom-fixtures/nih-submission/schemas';
import repos from '../custom-fixtures/nih-submission/repositories';
import policies from '../custom-fixtures/nih-submission/policies';
import doiJournals from '../fixtures/doi-journals';
import grants from '../custom-fixtures/nih-submission/grants';
import funders from '../custom-fixtures/nih-submission/funders';

export default function (server) {
  server.create('user', {
    id: '0',
    displayName: 'Nihu Ser',
    email: 'nihuser@jhu.edu',
    firstName: 'Nihu',
    lastName: 'Ser',
    locatorIds: [
      `johnshopkins.edu:jhed:123425`,
      `johnshopkins.edu:hopkinsid:12345`,
      `johnshopkins.edu:employeeid:12345`,
      `johnshopkins.edu:jhed:12345`,
    ],
    roles: ['submitter'],
    username: 'nih-user@johnshopkins.edu',
  });

  repos.forEach((repo) => {
    server.create('repository', {
      _source: repo,
    });
  });

  policies.forEach((policy) => {
    server.create('policy', {
      _source: policy,
    });
  });

  grants.forEach((grant) => {
    server.create('grant', {
      _source: grant,
    });
  });

  funders.forEach((funder) => {
    server.create('funder', funder);
  });

  server.create('journal', doiJournals);

  server.create('journal', {
    '@id': 'https://pass.local/fcrepo/rest/journals/f5/62/2a/cf/f5622acf-ca44-40cb-ac3d-4ca76448ded4',
    '@type': 'Journal',
    issns: ['Print:0003-2654', 'Online:1364-5528'],
    journalName: 'The Analyst',
    nlmta: 'Analyst',
    '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    _source: {
      '@id': 'https://pass.local/fcrepo/rest/journals/f5/62/2a/cf/f5622acf-ca44-40cb-ac3d-4ca76448ded4',
      '@type': 'Journal',
      issns: ['Print:0003-2654', 'Online:1364-5528'],
      journalName: 'The Analyst',
      nlmta: 'Analyst',
      '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    },
  });

  metaDataSchema.forEach((schema) => {
    server.create('schema', schema);
  });
}
