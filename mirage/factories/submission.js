import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const SubmissionFactory = Factory.extend({
  aggregatedDepositStatus: 'not-started',
  submittedDate: faker.date.anytime(),
  source: 'pass',
  metadata: '',
  submitted: false,
  submitterName: 'Nihu User',
  submitterEmail: 'nih@user.com',
});

export default SubmissionFactory;
