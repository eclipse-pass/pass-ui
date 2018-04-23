import Component from '@ember/component';

export default Component.extend({
  date: null,
  didRender(){
    let dd = this.get('record.dateSubmitted').getDate();
    let mm = this.get('record.dateSubmitted').getMonth()+1;
    let yyyy = this.get('record.dateSubmitted').getFullYear();
    if(dd<10){ dd='0'+dd; }
    if(mm<10){ mm='0'+mm; }
    this.set('date',  dd+'/'+mm+'/'+yyyy)
  }
});
