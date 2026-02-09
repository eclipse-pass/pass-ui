import Model, { attr, belongsTo } from '@ember-data/model';
import type JournalModel from './journal';

export default class PublicationModel extends Model {
  @attr('string') declare doi: string;
  @attr('string') declare title: string;
  @attr('string') declare publicationAbstract: string;
  @attr('string') declare volume: string;
  @attr('string') declare issue: string;
  @attr('string') declare pmid: string;

  @belongsTo('journal', { async: true, inverse: null }) declare journal: JournalModel;

  get abstract(): string {
    return this.publicationAbstract;
  }

  // TODO: may be removed if `publicationAbstract` is renamed to `abstract`
  set abstract(value: string) {
    this.publicationAbstract = value;
  }
}
