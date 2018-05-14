import DS from 'ember-data';

export default DS.Model.extend({
  /** Possible values: not-started, in-progress, accepted */
  aggregatedDepositStatus: DS.attr('string', { defaultValue: 'not-started' }),
  submittedDate: DS.attr('date'),
  source: DS.attr('string', { defaultValue: 'pass' }),
  metadata: DS.attr('string', { defaultValue: '[]' }), // Stringified JSON
  submitted: DS.attr('boolean', { defaultValue: false }),

  user: DS.belongsTo('user'),
  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', { async: true }), // not on this model on API
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  grants: DS.hasMany('grant', { async: true }),

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
  // repoCopies: Ember.computed('deposits', function () {
  //   let repoCopyUrls = [];
  //   return this.get('store').query('deposit', {
  //     query: {
  //       term: { submission: this.get('id') }
  //     },
  //     from: 0,
  //     size: 100
  //   }).then((results) => {
  //     results.forEach((deposit) => {
  //       // debugger;
  //       repoCopyUrls.push(deposit.get('repositoryCopy.accessUrl'));
  //       if (deposit.get('repositoryCopy.externalIds')) {
  //         deposit.get('repositoryCopy.externalIds').forEach((extId) => {
  //           repoCopyUrls.push(extId);
  //         });
  //       }
  //     });
  //     debugger;
  //     return repoCopyUrls.join(" ");
  //   });
  // })
});
