import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const PolicyFactory = Factory.extend({
  title: `${faker.word.noun()} Policy`,
  description: faker.lorem.sentences(),
  policyUrl: faker.internet.url(),
  institution: `${faker.word.noun()} Institution`,
});

export default PolicyFactory;
