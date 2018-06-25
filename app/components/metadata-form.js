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
      const doiInfo = this.get('doiInfo');
      if (shouldFuzzyMatch && Object.keys(doiInfo).length > 0) {
        const prePopulateData = {};
        //  Try to match the doiInfo to the form schema data to populate
        Promise.resolve(originalForm.schema).then((schema) => {
          try {
            // Fuzzy Match here
            const f = fuzzySet(Object.keys(schema.properties));
            for (const doiEntry in doiInfo) {
              // Validate and check any doi data to make sure its close to the right field
              if (f.get(doiEntry) !== null) {
                try {
                  doiInfo[doiEntry] = doiInfo[doiEntry].replace(/(<([^>]+)>)/ig, '');
                } catch (e) {} // eslint-disable-line no-empty
                if (doiEntry == 'author') {
                  doiInfo[doiEntry].forEach((author, index) => {
                    const name = `${doiInfo[doiEntry][index].given} ${doiInfo[doiEntry][index].family}`;
                    const orcid = doiInfo[doiEntry][index].ORCID;

                    if (!prePopulateData[f.get(doiEntry)[0][1]]) {
                      prePopulateData[f.get(doiEntry)[0][1]] = [];
                    }
                    prePopulateData[f.get(doiEntry)[0][1]].push({ author: name, orcid });
                  });
                } else if (doiInfo[doiEntry].length > 0) {
                  // Predicts data with .61 accuracy
                  if (f.get(doiEntry)[0][0] > 0.61) {
                    // set the found record to the metadata
                    // due to short title you have to call this
                    if (!(doiEntry === 'container-title-short')) {
                      prePopulateData[f.get(doiEntry)[0][1]] = doiInfo[doiEntry];
                    }
                  }
                }
              }
            }
            // set any data to the forms
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

    // Validate common page
    let isValidated = true;
    if (newForm.options.fields['Embargo-end-date']) {
      newForm.options.fields['Embargo-end-date'].validator = function (callback) {
        var value = this.getValue();
        var underEmbargo = this.getParent().childrenByPropertyId['under-embargo'].getValue();
        if (underEmbargo && !value) {
          toastr.warning('The embargo end date must not be left blank');
          isValidated = false;
          callback({
            status: false,
            message: 'This field is required'
          });
          return;
        }
        $('input[name=Embargo-end-date]').css('border-color', '#c2cfd6');
        $('.alpaca-form-button-Next').css('opacity', '1');
        isValidated = true;
        callback({
          status: true
        });
      };
    }

    if (newForm.options.fields['under-embargo']) {
      newForm.options.fields['under-embargo'].validator = function (callback) {
        var underEmbargo = this.getParent().childrenByPropertyId['under-embargo'].getValue();
        var EmbargoEndDate = this.getParent().childrenByPropertyId['Embargo-end-date'].getValue();

        if (underEmbargo && !EmbargoEndDate) {
          isValidated = false;
          $('input[name=Embargo-end-date]').css('border-color', '#f86c6b');
          $('.alpaca-form-button-Next').css('opacity', '0.65');
          return;
        }
        $('input[name=Embargo-end-date]').css('border-color', '#c2cfd6');
        $('.alpaca-form-button-Next').css('opacity', '1');
        isValidated = true;
      };
    }
    // form ctrls
    newForm.options.form = {
      buttons: {
        Next: {
          label: 'Next',
          styles: 'pull-right btn btn-primary next',
          click() {
            if (isValidated) {
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
            }
          },
        },
        Back: {
          title: 'Back',
          styles: 'pull-left btn btn-outline-primary',
          click() {
            that.previousForm();
          },
        },
      },
    };

    // set readonly fields
    for (const doiEntry in this.get('doiInfo')) {
      // Validate and check any doi data to make sure its close to the right field
      try {
        this.get('doiInfo')[doiEntry] = this.get('doiInfo')[doiEntry].replace(/(<([^>]+)>)/ig, '');
        if (doiEntry == 'author') {
          newForm.schema.properties.authors.readonly = true;
          newForm.options.fields.authors.hidden = false;
        } else if (this.get('doiInfo')[doiEntry].length > 0) {
          if (!(doiEntry === 'container-title-short')) {
            newForm.schema.properties[doiEntry].readonly = true;
            newForm.options.fields[doiEntry].hidden = false;
          }
        }
      } catch (e) {} // eslint-disable-line no-empty
    }


    $(document).ready(() => {
      $('#schemaForm').empty();
      $('#schemaForm').alpaca(newForm);
    });
  }
});
