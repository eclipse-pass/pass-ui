import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  awardNumber: 'ABC123',
  status: 'NST',
  externalId: 'XYZ789',
  projectName: 'Example Project',
  awardDate() {
    return Date();
  },
  startDate() {
    return Date();
  },
  endDate() {
    return Date();
  },

  funder: association(),
  // submissions: association()
});
