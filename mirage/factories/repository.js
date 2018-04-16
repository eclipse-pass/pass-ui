import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  name: 'Example Repo',
  description: 'This is an example repository',
  url: 'http://example.com',

  // policy: association(),
});
