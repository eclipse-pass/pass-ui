import DS from 'ember-data';

export default DS.Model.extend({
    firstName: DS.attr('string'),
    middleName: DS.attr('string'),
    lastName: DS.attr('string'),
    email: DS.attr('string'),
    orcid: DS.attr('string'),
    user: DS.belongsTo('user'),
    role: DS.attr('string'),
});
