// import Component from '@ember/component';
import Ember from 'ember';

export default Ember.Component.extend({
  didRender() {
    this._super(...arguments);
    const that = this;
    const originalForm = this.get('schema');
    const newForm = JSON.parse(JSON.stringify(originalForm));
    if (!originalForm.options) {
      newForm.options = {};
    }
    // Populate form with data if there is any to populate with.
    if (!(this.get('model.metadata'))) {
      this.set('model.metadata', '[]');
    }
    let metadata = JSON.parse(this.get('model.metadata'));
    if (newForm.id) {
      let shouldFuzzyMatch = true;
      metadata.forEach((data) => {
        if (data.id == newForm.id) {
          shouldFuzzyMatch = false;
          newForm.data = data.data;
        }
      });

      if (shouldFuzzyMatch) { // need to fix This
        const prePopulateData = {};
        //  Try to match the doiInfo to the form schema data to populate
        Promise.resolve(originalForm.schema).then((schema) => {
          try {
            const doiInfo = this.get('doiInfo');
            // // Fuzy Match here
            const f = fuzzySet(Object.keys(schema.properties));
            for (const doiEntry in doiInfo) {
              // Validate and check any doi data to make sure its close to the right field
              if (f.get(doiEntry) !== null) {
                if (doiEntry == 'author') {
                  const name = `${doiInfo[doiEntry][0].given} ${doiInfo[doiEntry][0].family}`;
                  prePopulateData[f.get(doiEntry)[0][1]] = name;

                  const family = doiInfo[doiEntry][0].family;
                  prePopulateData.family = family;
                } else if (doiInfo[doiEntry].length > 0) {
                  // Predicts data with .61 accuracy
                  if (f.get(doiEntry)[0][0] > 0.61) {
                    console.log(doiEntry, doiInfo[doiEntry], f.get(doiEntry)[0][0]);
                    // set the found record to the metadata
                    prePopulateData[f.get(doiEntry)[0][1]] = doiInfo[doiEntry];
                  }
                }
              }
            }
            newForm.data = prePopulateData;
            metadata[newForm.id] = ({
              id: newForm.id,
              data: prePopulateData,
            });
            this.set('model.metadata', JSON.stringify(metadata));
          } catch (e) { console.log(e); }
        });
      }
    }
    // form ctrls
    newForm.options.form = {
      buttons: {
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary',
          click() {
            const value = this.getValue();
            // concat auther + family together
            // value.author = `${value.author} ${value.family}`;
            // delete value.family;
            const formId = newForm.id;
            metadata.push({
              id: formId,
              data: value,
            });
            // remove any duplicates
            let uniqIds = {},
              source = metadata;
            // eslint-disable-next-line no-return-assign
            let filtered = source.reverse().filter(obj => !uniqIds[obj.id] && (uniqIds[obj.id] = true));

            that.set('model.metadata', JSON.stringify(filtered));
            that.nextForm();
          },
        },
        Back: {
          title: 'Back',
          click() {
            that.previousForm();
          },
        },
      },
    };

    $(document).ready(() => {
      $('#schemaForm').empty();
      $('#schemaForm').alpaca(newForm);
    });
  },
  actions: {
    nextForm() {
      this.sendAction('nextForm');
    },
    previousForm() {
      this.sendAction('previousForm');
    },
  },
});
