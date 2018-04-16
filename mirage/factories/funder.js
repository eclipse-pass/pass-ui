import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  name: 'Example Funder',
  url: 'http://example.com',
  localId: 'abc123',
  //
  policy: association(),
  repository: association()
});
