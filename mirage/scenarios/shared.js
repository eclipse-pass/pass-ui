/**
 * Note use of custom fixtures directory. This needs to happen because
 * Mirage maps the fixtures directory and will not allow mismatches between
 * Mirage model names and fixture files and also will not allow sub-directories.
 * This means these files are not Mirage fixtures and cannot be used with the
 * Mirage loadFixtures() method so we combine their use with factories instead.
 */
import doiJournals from '../custom-fixtures/nih-submission/doi-journals';

export default function (server) {
  // server.create('journal', doiJournals);

  server.create('journal', {
    id: '10',
    issns: ['Print:0003-2654', 'Online:1364-5528'],
    journalName: 'The Analyst',
    nlmta: 'Analyst',
  });
}
