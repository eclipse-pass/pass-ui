import Component from '@ember/component';
import Ember from 'ember';

/* Displays a form/dialog for creating or editing resources.
 *
 * Usage:
 * 
 * Create a {{resource-form}} block in your .hbs template, then 
 * fire a newResource action where appropriate (e.g. when clicking a button,
 * clicking on an icon, whatever).  Be sure to declare the component
 * as |something| and then send the action to that component 
 * via target=something
 * 
 * {{#resource-form as |form|}}
 *   <button {{action 'newResource' type initialObject target=form}}>NEW GRANT</button>
 * {{/resource-form}}
 * 
 * Where
 *  - 'type' is a String; the type of object to create
 *  - 'initialObject' is an object containing initial values.
 *     Property names and values that correspond to model attributes
 *     and relationships will pre-populate form values.
 *
 */
export default Component.extend({
    store: Ember.inject.service('store'),
    isShowingForm: false,
    actions: {
        newResource(type) {
            var resource = this.get('store').createRecord(type, {
                number: "createdViaForm",
                title: "title",
                agency: "moooo"
            });
            resource.save();
            this.toggleProperty('isShowingForm')
        },
        defaultSaveResource(resource) {
            resource.save();
        },
        editResource(src) {
            var resource = src instanceof Function ? src() : src;
            if (this.saveAction) {
                this.saveAction(resource);
            } else {
                this.actions.defaultSaveResource(resource);
            }
        }
    }
});
