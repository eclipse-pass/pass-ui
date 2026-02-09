import Model, { attr, belongsTo } from '@ember-data/model';
import type SubmissionModel from './submission';

export default class FileModel extends Model {
  @attr('string') declare name: string;
  @attr('string') declare description: string;
  /** Possible values: manuscript, supplemental, table, figure */
  @attr('string') declare fileRole: string;
  @attr('string') declare uri: string;
  @attr('string') declare mimeType: string;

  @belongsTo('submission', { async: false, inverse: null }) declare submission: SubmissionModel;
}

export const Role = {
  MANUSCRIPT: 'MANUSCRIPT',
  SUPPLEMENTAL: 'SUPPLEMENTAL',
  FIGURE: 'FIGURE',
  TABLE: 'TABLE',
} as const;
