import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmissionEventModel extends Model {
  @attr('string') eventType;
  @attr('date') performedDate;
  @attr('string') performerRole;
  @attr('string') comment;
  @attr('string') link;

  @belongsTo('submission', { async: true, inverse: '_submissionEvents' }) submission;
  @belongsTo('user', { async: false, inverse: null }) performedBy;
}

export const Type = {
  APPROVAL_REQUESTED_NEWUSER: 'APPROVAL_REQUESTED_NEWUSER',
  APPROVAL_REQUESTED: 'APPROVAL_REQUESTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  CANCELLED: 'CANCELLED',
  SUBMITTED: 'SUBMITTED',
};

export const Performer = {
  PREPARER: 'PREPARER',
  SUBMITTER: 'SUBMITTER',
};
