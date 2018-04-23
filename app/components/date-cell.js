import Component from '@ember/component';

export default Component.extend({
  date: null,
  didRender(){
    console.log(this.get('record.dateSubmitted'))
    this.set('date', 'gege')
  }
});
