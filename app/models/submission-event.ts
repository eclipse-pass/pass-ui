import Model, { attr, belongsTo } from '@ember-data/model';
import type SubmissionModel from './submission';
import type UserModel from './user';

export default class SubmissionEventModel extends Model {
  @attr('string') declare eventType: string;
  @attr('date') declare performedDate: Date;
  @attr('string') declare performerRole: string;
  @attr('string') declare comment: string;
  @attr('string') declare link: string;

  @belongsTo('submission', { async: false, inverse: '_submissionEvents' }) declare submission: SubmissionModel;
  @belongsTo('user', { async: false, inverse: null }) declare performedBy: UserModel;
}

export const Type = {
  APPROVAL_REQUESTED_NEWUSER: 'APPROVAL_REQUESTED_NEWUSER',
  APPROVAL_REQUESTED: 'APPROVAL_REQUESTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  CANCELLED: 'CANCELLED',
  SUBMITTED: 'SUBMITTED',
} as const;

export const Performer = {
  PREPARER: 'PREPARER',
  SUBMITTER: 'SUBMITTER',
} as const;
