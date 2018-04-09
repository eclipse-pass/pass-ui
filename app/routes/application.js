import Route from '@ember/routing/route';

export default Route.extend({
    /* Used as route-action in templates*/
    actions: {
        back() {
            history.back();
        },
        transitionTo(route, model) {
            this.transitionTo(route, model);
        }
    },
    model() {
        // temp jhuInstitution move out or remove later 
        let store = this.get('store');
        store.createRecord('institution', {
            name: 'Johns Hopkins University',
            primaryColor: "#002D72",
            secondaryColor:'black',
            tertiaryColor: '#f7f7f2',
            logo: 'https://image.ibb.co/iWgHXx/university_logo_small_vertical_white_no_clear_space_29e2bdee83.png',
            schema: []
        });
  }
});
