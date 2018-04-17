import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  firstName: 'Jane',
  middleName: 'Robins',
  lastName: 'Doe',
  email: 'jdoe@fake.io',
  institutionalId: 'ABC123',
  orcid: 'XYZ789',
  affiliation: 'UVa',
  role: 'PI',
  shibbolethId: 'ABC123',

  // submissionDraft: association(),
  // user: association(),
});
