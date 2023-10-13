import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const RepositoryFactory = Factory.extend({
  name: `${faker.word.noun()} Repository`,
  description: faker.lorem.sentences(),
  url: faker.internet.url(),
  formSchema: '',
  integrationType: 'FULL',
  repositoryKey: 'pmc',
});

export default RepositoryFactory;
