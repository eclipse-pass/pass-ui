import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  name: DS.attr('string'),
  description: DS.attr('string'),
  url: DS.attr('string'),
  formSchema: DS.attr('string'),
  integrationType: DS.attr('string'),
  agreementText: DS.attr('string', {
    defaultValue: false
  }),
  repositoryKey: DS.attr('string'),

  _selected: DS.attr('boolean'),
  _isWebLink: computed('integrationType', function () {
    return this.integrationType === 'web-link';
  })
});
