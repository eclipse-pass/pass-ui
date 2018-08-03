import { moduleFor, test } from 'ember-qunit';

moduleFor('service:submission-status', 'Unit | Service | submission status', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});
test('it exists', function (assert) {
  let service = this.subject();
  let submission = Ember.Object.create({
    aggregatedDepositStatus: 'not-started',
    submittedDate: null,
    source: 'other',
    metadata: '[]',
    submitted: true,
    user: 'https://pass/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95',
    publication: 'https://pass/fcrepo/rest/publications/2c/36/27/70/2c362770-feba-4751-a91c-eb4f1ff69214',
    repositories: ['https://pass/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2'],
    grants: ['https://pass/fcrepo/rest/grants/32/83/d3/a5/3283d3a5-56e3-4c20-be44-4e26969a5795']
  });
  let repoCopies = [];
  let deposits = [];
  let result = service.calculateStatus(submission, repoCopies, deposits);
  assert.equal(result, 'See details');
  assert.ok(service);
});
