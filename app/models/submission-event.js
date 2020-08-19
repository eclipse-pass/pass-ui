import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmissionEventModel extends Model {
  @attr('string') eventType;
  @attr('date') performedDate;
  @attr('string') performerRole;
  @attr('string') comment;
  @attr('string') link;

  @belongsTo('submission') submission;
  @belongsTo('user') performedBy;
}
