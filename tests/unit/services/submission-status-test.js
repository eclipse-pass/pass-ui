import { moduleFor, test } from 'ember-qunit';

moduleFor('service:submission-status', 'Unit | Service | submission status', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});
test('it shows the correct values according to the input', function (assert) {
  let service = this.subject();
  assert.ok(service);
  let submission = Ember.Object.create({
    aggregatedDepositStatus: 'failed',
    submittedDate: null,
    source: 'other',
    metadata: '[]',
    submitted: true,
    user: Ember.Object.create({

    }),
    publication: Ember.Object.create({

    }),
    repositories: [
      Ember.Object.create({

      })
    ],
    grants: [
      Ember.Object.create({

      })
    ]
  });
  let repoCopies = [];
  let deposits = [];
  let result = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result, 'See details');

  // Manuscript expected
  submission.set('aggregatedDepositStatus', 'not-started');
  submission.set('source', 'other');
  submission.set('submitted', false);
  let result2 = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result2, 'Manuscript expected');

  // Submitted
  submission.set('source', 'pass');
  submission.set('submitted', true);
  let result3 = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result3, 'Submitted');

  // Stalled
  repoCopies = [
    Ember.Object.create({
      copyStatus: 'stalled'
    }),
    Ember.Object.create({
      copyStatus: 'stalled'
    }),
    Ember.Object.create({
      copyStatus: 'complete'
    })
  ];
  let result4 = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result4, 'Stalled');

  repoCopies = [
    Ember.Object.create({
      copyStatus: 'complete'
    })
  ];
  deposits = [
    Ember.Object.create({})
  ];
  let result5 = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result5, 'Complete');

  repoCopies.push(Ember.Object.create({ copyStatus: 'complete' }));
  repoCopies.push(Ember.Object.create({ copyStatus: 'incomplete' }));
  submission.set('source', 'other');
  let result6 = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result6, 'Complete');
});
