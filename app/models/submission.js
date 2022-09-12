/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/require-computed-property-dependencies */
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { computed, get } from '@ember/object';

export default class SubmissionModel extends Model {
  /** Possible values: not-started, in-progress, accepted */
  @attr('enum', {
    defaultValue: 'not-started',
  })
  aggregatedDepositStatus;
  @attr('date') submittedDate;
  @attr('enum', { defaultValue: 'pass' }) source;
  @attr('string') metadata;
  @attr('boolean', { defaultValue: false }) submitted;
  @attr('enum') submissionStatus;
  @attr('string') submitterName;
  @attr('string', {
    defaultValue: null,
  })
  submitterEmail;

  @belongsTo('user') submitter;
  @belongsTo('publication') publication;

  @hasMany('user') preparers;
  @hasMany('repository') repositories;
  @hasMany('policy') effectivePolicies;
  // not on this model on API
  @hasMany('submissionEvent', {
    async: true,
  })
  _submissionEvents;
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  @hasMany('grant', {
    async: true,
  })
  grants;

  // computed attributes for tables and to support some logic
  @computed(
    'submitterEmail',
    'submitterEmail.length',
    'submitterName',
    'submitterName.length',
    'preparers',
    'preparers.length'
  )
  get isProxySubmission() {
    return (
      (this.submitterEmail &&
        get(this, 'submitterEmail.length') > 0 &&
        this.submitterName &&
        get(this, 'submitterName.length') > 0) ||
      (this.preparers && get(this, 'preparers.length') > 0)
    );
  }

  @computed('submitterEmail')
  get submitterEmailDisplay() {
    if (this.submitterEmail) {
      return this.submitterEmail.replace('mailto:', '');
    }
    return this.submitterEmail;
  }

  @computed('publication')
  get publicationTitle() {
    return get(this, 'publication.title');
  }

  @computed('repositories')
  get repositoryNames() {
    let repoNames = [];
    this.repositories.forEach((repo) => {
      repoNames.push(repo.get('name'));
    });
    return repoNames;
  }

  @computed('grants')
  get grantInfo() {
    let grants = [];
    this.grants.forEach((grant) => {
      grants.push(grant.get('awardNumber'));
      grants.push(grant.get('primaryFunder.name'));
      grants.push(grant.get('projectName'));
    });
    return grants;
  }

  @computed('source', 'submitted')
  get isStub() {
    return this.source === 'other' && !this.submitted;
  }

  /**
   * @returns {boolean} is this a draft submission?
   */
  @computed('submitted', 'submissionStatus')
  get isDraft() {
    return this.submissionStatus === 'draft';
  }

  /**
   * @returns {boolean} is this a covid related submission?
   */
  @computed('metadata')
  get isCovid() {
    let metadata = get(this, 'metadata') ? JSON.parse(get(this, 'metadata')) : {};

    if ('hints' in metadata) {
      let tags = metadata.hints['collection-tags'];

      return tags.includes('covid');
    }

    return false;
  }
}

export const SubmissionStatus = {
  DRAFT: 'DRAFT',
  MANUSCRIPT_REQUIRED: 'MANUSCRIPT_REQUIRED',
  APPROVAL_REQUESTED: 'APPROVAL_REQUESTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  CANCELLED: 'CANCELLED',
  SUBMITTED: 'SUBMITTED',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  COMPLETE: 'COMPLETE',
};

export const AggregatedDepositStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const Source = {
  PASS: 'PASS',
  OTHER: 'OTHER',
};
