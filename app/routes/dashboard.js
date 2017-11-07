import Route from '@ember/routing/route';

export default Route.extend({

  
  
  // TODO Use RSVP.hash to combine more info?
  model() {
    return this.get('store').findAll('grant');
  }
});
