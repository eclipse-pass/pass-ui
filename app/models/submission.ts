import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import type UserModel from './user';
import type PublicationModel from './publication';
import type RepositoryModel from './repository';
import type PolicyModel from './policy';
import type GrantModel from './grant';
import type SubmissionEventModel from './submission-event';

export default class SubmissionModel extends Model {
  /** Possible values: not-started, in-progress, accepted */
  @attr('string', {
    defaultValue: 'not-started',
  })
  declare aggregatedDepositStatus: string;
  @attr('date') declare submittedDate: Date;
  @attr('string', { defaultValue: 'pass' }) declare source: string;
  @attr('string') declare metadata: string;
  @attr('boolean', { defaultValue: false }) declare submitted: boolean;
  @attr('string') declare submissionStatus: string;
  @attr('string') declare submitterName: string;
  @attr('string', {
    defaultValue: null,
  })
  declare submitterEmail: string;
  @attr('number') declare version: number;

  @belongsTo('user', { async: false, inverse: null }) declare submitter: UserModel;
  @belongsTo('publication', { async: true, inverse: null }) declare publication: PublicationModel;

  @hasMany('user', { async: false, inverse: null }) declare preparers: UserModel[];
  @hasMany('repository', { async: false, inverse: null }) declare repositories: RepositoryModel[];
  @hasMany('policy', { async: true, inverse: null, resetOnRemoteUpdate: false })
  declare effectivePolicies: PolicyModel[];
  // not on this model on API
  @hasMany('submission-event', {
    async: true,
    inverse: 'submission',
  })
  declare _submissionEvents: SubmissionEventModel[];
  /**
   * List of grants related to the item being submitted. The grant PI determines who can perform
   * the submission and in the case that there are mutliple associated grants, they all should
   * have the same PI. If a grant has a different PI, it should be a separate submission.
   */
  @hasMany('grant', {
    async: true,
    inverse: null,
  })
  declare grants: GrantModel[];

  get isProxySubmission(): boolean {
    return (
      (!!this.submitterEmail &&
        this.submitterEmail.length > 0 &&
        !!this.submitterName &&
        this.submitterName.length > 0) ||
      (!!this.preparers && this.preparers.length > 0)
    );
  }

  get submitterEmailDisplay(): string {
    if (this.submitterEmail) {
      return this.submitterEmail.replace('mailto:', '');
    }
    return this.submitterEmail;
  }

  get publicationTitle(): string {
    return this.publication?.title;
  }

  get repositoryNames(): string[] {
    const repoNames: string[] = [];
    this.repositories.forEach((repo) => {
      repoNames.push(repo.name);
    });
    return repoNames;
  }

  get grantInfo(): string[] {
    const grants: string[] = [];
    this.grants.forEach((grant) => {
      grants.push(grant.awardNumber);
      grants.push(grant.primaryFunder?.name);
      grants.push(grant.projectName);
    });
    return grants;
  }

  get isStub(): boolean {
    return this.source === 'other' && !this.submitted;
  }

  /**
   * @returns is this a draft submission?
   */
  get isDraft(): boolean {
    return this.submissionStatus === 'draft';
  }

  /**
   * @returns is this a covid related submission?
   */
  get isCovid(): boolean {
    const metadata = this.metadata ? JSON.parse(this.metadata) : {};

    if ('hints' in metadata) {
      const tags = metadata.hints['collection-tags'];

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
} as const;

export const AggregatedDepositStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const Source = {
  PASS: 'PASS',
  OTHER: 'OTHER',
} as const;
