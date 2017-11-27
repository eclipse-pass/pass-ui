import Component from '@ember/component';
import Ember from 'ember';

/* Displays a form/dialog for creating or editing resources.
 *
 * Usage:
 *
 * Create a {{resource-form}} block in your .hbs template, then
 * fire a newResource or editResource action where appropriate (e.g. when clicking a button,
 * clicking on an icon, whatever).  Be sure to declare the component
 * as |something| and then send the action to that component
 * via target=something
 *
 * {{#resource-form as |form|}}
 *   <button {{action 'newResource' initialValues target=form}}>NEW GRANT</button>
 * {{/resource-form}}
 *
 * or
 *
 * {{#resource-form as |form|}}
 *   <button {{action 'editResource' resource target=form}}>NEW GRANT</button>
 * {{/resource-form}}
 *
 * Where
 *  - 'type' is a String; the type of object to create
 *  - 'initialValues' is an object/hash containing initial values with keys that
 *     correspond to model attributes.
 *  -  'resource' is a DS.Model, or function that returns a DS.Model of the resource to be
 *     edited.  The form will mutate it, then save (or rollback) when finished
 *
 * It is possible to specify a custom save action if additional (context-specific)
 * things have to happen to the resource as part of the saving process; such as adding certain
 * relationships.  Do this via:
 *
 * {{#resource-form saveAction=(action 'myAction' args) as |form|}}
 */
export default Component.extend({
    store: Ember.inject.service('store'),

    /* The default save action, which is just to save.
     * Can be overrided when declaring the component in the template.
     *
     * For example {{#resource-form saveAction=(action "mySaveAction") as |form|}}
     */
    saveAction: (resource) => resource.save(),

    /* Whether the modal form is showing */
    isShowingForm: false,

    /* The resource, an ember DS.Model */
    resource: null,

    /* Type of resource */
    type: null,

    actions: {

        newResource(type) {
            this.set('type', type);
            this.set('resource', this.get('store').createRecord(type, {
                awardNumber: "createdViaForm",
                projectName: "Moo Trek " + Math.floor(Math.random() * 100),
                status: "dead",
                copyright: "wrong"
            }));
            this.set('isShowingForm', true);
        },

        editResource(src) {
            var resource = src instanceof Function ? src() : src;
            this.set('type', resource.get('type'));
            this.set('resource', resource);
            this.set('isShowingForm', true);
        },

        persistAndClose() {
            var resource = this.get('resource');

            // If this fails, it'll just re-display the form.
            // We should probably capture and display the error somehow
            Promise.resolve(this.saveAction(resource)).then(() => {},
                () => this.set('isShowingForm', true));

            this.set('isShowingForm', false);
        },

        cancelAndClose() {
            this.get('resource').rollbackAttributes();
            this.set('isShowingForm', false);
        }
    }
});
