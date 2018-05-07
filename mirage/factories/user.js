import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  username: 'jdoe',
  isStaff: false,
  isActive: true,
  isSuperuser: false,
  isAnonymous: false,

  firstName: 'Jane',
  middleName: 'Robins',
  lastName: 'Doe',
  email: 'jdoe@fake.io',
  institutionalId: 'ABC123',
  orcId: 'XYZ789',
  affiliation: 'UVa',
  roles: ['submitter'],
  shibbolethId: 'ABC123',

  dateJoined() {
    return Date();
  },
});
