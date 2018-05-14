import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  depositStatus: 'PND',
  userSubmittedDate() {
    return Date();
  },
  source: 'JHU',
  metadata: '{someData:"data"}',
  pubmedId: 'ABC123',
  submitted: 'True',
  files: {},

  // user: association(),
  // publication: association(),
  // repositories: [association()], // not on this model on API
  // deposits: [association()],
  // grants: [association()],
});
