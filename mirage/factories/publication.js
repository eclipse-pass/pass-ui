import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  // doi, title, abstract, journal, volume, issue
  doi: 'XYZ789',
  title: 'My Publication Title',
  abstract: 'This is an abstract. Yadda yadda.',
  volume: '12.4',
  issue: 'Spring 18',

  // journal: association(),
  // submissions: [association()]
});
