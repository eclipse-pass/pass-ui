import Model, { attr, belongsTo } from '@ember-data/model';

export default class PublicationModel extends Model {
  // doi, title, abstract, journal, volume, issue
  @attr('string') doi;
  @attr('string') title;
  @attr('string') publicationAbstract;
  @attr('string') volume;
  @attr('string') issue;
  @attr('string') pmid;

  @belongsTo('journal', { async: true, inverse: null, autoSave: true }) journal;
  get abstract() {
    return this.publicationAbstract;
  }
  // TODO: may be removed if `publicationAbstract` is renamed to `abstract`
  set abstract(value) {
    this.publicationAbstract = value;
  }
}
