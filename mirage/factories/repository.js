import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  name: 'Example Repository',
  description: 'This is an example repository',
  url: 'http://example.com',

  policy: association(),
});
