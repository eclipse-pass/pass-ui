import DS from 'ember-data';

export default DS.Model.extend({
    copyright: DS.attr('string'),
    status: DS.attr('string'),
    grants: DS.hasMany('grant'),
    creator: DS.belongsTo('user'),
    creation_date: DS.attr('date')    
});
