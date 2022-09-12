import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmissionEventModel extends Model {
  @attr('enum') eventType;
  @attr('date') performedDate;
  @attr('enum') performerRole;
  @attr('string') comment;
  @attr('string') link;

  @belongsTo('submission') submission;
  @belongsTo('user') performedBy;
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
