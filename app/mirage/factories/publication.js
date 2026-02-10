import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const PublicationFactory = Factory.extend({
  volume: faker.string.numeric(1),
  issue: faker.string.numeric(2),
  pmid: faker.string.numeric(8),
  title: faker.lorem.sentences(),
  doi: '10.1089/ars.2015.6327',
});

export default PublicationFactory;
