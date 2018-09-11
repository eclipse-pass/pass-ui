import DS from 'ember-data';

export default DS.Model.extend({
  /** Possible values: not-started, in-progress, accepted */
  aggregatedDepositStatus: DS.attr('string', { defaultValue: 'not-started' }),
  submittedDate: DS.attr('date'),
  source: DS.attr('string', { defaultValue: 'pass' }),
  metadata: DS.attr('string', { defaultValue: '[]' }), // Stringified JSON
  submitted: DS.attr('boolean', { defaultValue: false }),

  submitter: DS.belongsTo('user'),
  preparers: DS.hasMany('user', { async: true }),
  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', { async: true }), // not on this model on API
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  grants: DS.hasMany('grant', { async: true }),

  hasProxy: Ember.computed('preparers', function() {
    return !!(this.get('preparers'));
  }),
  // don't get saved to database
  removeNIHDeposit: false,

  // attributes needed for tables
  publicationTitle: Ember.computed('publication', function () {
    return this.get('publication.title');
  }),

  repositoryNames: Ember.computed('repositories', function () {
    let repoNames = [];
    this.get('repositories').forEach((repo) => {
      repoNames.push(repo.get('name'));
    });
    return repoNames;
  }),
  grantInfo: Ember.computed('grants', function () {
    let grants = [];
    this.get('grants').forEach((grant) => {
      grants.push(grant.get('awardNumber'));
      grants.push(grant.get('primaryFunder.name'));
      grants.push(grant.get('projectName'));
    });
    return grants;
  }),
  isStub: Ember.computed('source', 'submitted', function () {
    return this.get('source') === 'other' && !(this.get('submitted'));
  }),
});
