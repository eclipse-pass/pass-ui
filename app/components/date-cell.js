import Component from '@ember/component';

export default Component.extend({
  date: null,
  didRender() {
    let dataPath = this.get('column.propertyName');
    try {
      let dd = this.get(`record.${dataPath}`).getDate();
      let mm = this.get(`record.${dataPath}`).getMonth() + 1;
      let yyyy = this.get(`record.${dataPath}`).getFullYear();
      if (dd < 10) { dd = `0${dd}`; }
      if (mm < 10) { mm = `0${mm}`; }
      this.set('date', `${dd}/${mm}/${yyyy}`);
    } catch (e) {} // eslint-disable-line no-empty
  }
});
