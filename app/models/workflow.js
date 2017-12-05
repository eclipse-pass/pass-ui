import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    step: DS.attr('string'),

    // Comma-separated string of steps, since arays are difficult
    steps: DS.attr('string'),
});
