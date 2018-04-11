import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    email: DS.attr('string'),
    orcid: DS.attr('string'),
    user: DS.belongsTo('user'),
});
