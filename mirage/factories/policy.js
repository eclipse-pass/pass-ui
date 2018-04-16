import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: 'Example Policy',
  description: 'Example Description',
  url: 'http://example.com',
  metadata: "{\"id\": \"ep\",\"schema\": {\"title\": \"Example Policy (EP) <br><p class='lead text-muted'>This is filler text for where any kind of form you want can appear.</p>\",\"type\": \"object\",\"properties\": {}},\"options\": {\"fields\": {}}}",

  // funder: association(),
});
