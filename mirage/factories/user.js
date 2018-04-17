import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  username: '1',
  isStaff: false,
  isActive: true,
  isSuperuser: false,
  isAnonymous: false,

  firstName: 'Jane',
  middleName: 'Robins',
  lastName: 'Doe',
  email: 'jdoe@fake.io',
  institutionalId: 'ABC123',
  orcid: 'XYZ789',
  affiliation: 'UVa',
  role: 'PI',
  shibbolethId: 'ABC123',

  dateJoined() {
    return Date();
  },
});
