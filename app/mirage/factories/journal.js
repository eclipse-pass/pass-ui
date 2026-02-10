import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const JournalFactory = Factory.extend({
  journalName: `${faker.word.noun()} Journal`,
  nlmta: faker.word.noun(),
  pmcParticipation: 'A',
  issns: `${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
});

export default JournalFactory;
