import { computed, get } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  /** Possible values: not-started, in-progress, accepted */
  aggregatedDepositStatus: DS.attr('string', {
    defaultValue: 'not-started'
  }),
  submittedDate: DS.attr('date'),
  source: DS.attr('string', { defaultValue: 'pass' }),
  metadata: DS.attr('string'), // Stringified JSON
  submitted: DS.attr('boolean', { defaultValue: false }),
  submissionStatus: DS.attr('string'),
  submitterName: DS.attr('string'),
  submitterEmail: DS.attr('string'), // format: "mailto:jane@example.com"
  submitter: DS.belongsTo('user'),
  preparers: DS.hasMany('user'),
  publication: DS.belongsTo('publication'),
  repositories: DS.hasMany('repository', {
    async: true
  }),
  effectivePolicies: DS.hasMany('policy', { async: true }),

  // not on this model on API
  _submissionEvents: DS.hasMany('submissionEvent', {
    async: true
  }),
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  grants: DS.hasMany('grant', {
    async: true
  }),

  // computed attributes for tables and to support some logic
  isProxySubmission: computed(
    'submitterEmail', 'submitterEmail.length',
    'submitterName', 'submitterName.length',
    'preparers', 'preparers.length',
    function () {
      return (
        (this.get('submitterEmail') && this.get('submitterEmail.length') > 0
          && this.get('submitterName') && this.get('submitterName.length') > 0
        ) || (this.get('preparers') && this.get('preparers.length') > 0)
      );
    }
  ),

  submitterEmailDisplay: computed('submitterEmail', function () {
    if (this.get('submitterEmail')) {
      return this.get('submitterEmail').replace('mailto:', '');
    }
    return this.get('submitterEmail');
  }),

  publicationTitle: computed('publication', function () {
    return this.get('publication.title');
  }),

  repositoryNames: computed('repositories', function () {
    let repoNames = [];
    this.get('repositories').forEach((repo) => {
      repoNames.push(repo.get('name'));
    });
    return repoNames;
  }),
  grantInfo: computed('grants', function () {
    let grants = [];
    this.get('grants').forEach((grant) => {
      grants.push(grant.get('awardNumber'));
      grants.push(grant.get('primaryFunder.name'));
      grants.push(grant.get('projectName'));
    });
    return grants;
  }),
  isStub: computed('source', 'submitted', function () {
    return this.get('source') === 'other' && !(this.get('submitted'));
  }),

  /**
   * @returns {boolean} is this a draft submission?
   */
  isDraft: computed('submitted', 'submissionStatus', function () {
    return this.get('submissionStatus') === 'draft';
    // return !this.get('submitted') && !this.get('submissionStatus');
  }),

  /**
   * @returns {boolean} is this a covid related submission?
   */
  isCovid: computed('metadata', function () {
    let metadata = get(this, 'metadata') ? JSON.parse(get(this, 'metadata')) : {};

    if ('hints' in metadata) {
      let tags = metadata.hints['collection-tags'];

      return tags.includes('covid');
    }

    return false;
  })
});
