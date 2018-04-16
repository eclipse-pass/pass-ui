import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  username: '1',
  firstName: '2',
  lastName: '3',
  email: '4',
  isStaff: false,
  isActive: true,
  isSuperuser: false,
  isAnonymous: false,
  dateJoined() {
    return Date();
  },

  person: association(),
});
