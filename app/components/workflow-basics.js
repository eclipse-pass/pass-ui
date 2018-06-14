import Component from '@ember/component';
import { inject as service, } from '@ember/service';


function resolve(submission) {
  const base = 'https://doi.org/';

  let doi = submission.get('doi');
  if (!doi) {
    return Promise.reject(new Error('No DOI present'));
  }
  doi = doi.replace(/https?:\/\/(dx\.)?doi\.org\//gi, '');

  return fetch(base + encodeURI(doi), {
    redirect: 'follow',
    headers: {
      Accept: 'application/vnd.citationstyles.csl+json',
    },
  }).then((response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }).then(response => response.json());
}

export default Component.extend({
  store: service('store'),
  doiJournal: false,
  validDOI: 'form-control',
  isValidDOI: false,
  validTitle: 'form-control',
  nextDisabled: Ember.computed('model.publication.journal', 'model.publication.title', function () {
    if (
      this.get('model.publication.journal') &&
      this.get('model.publication.title')) {
      return false;
    }
    return true;
  }),
  init() {
    this._super(...arguments);
  },
  didRender() {
    this._super(...arguments);
  },
  didInsertElement() {
    this._super(...arguments);
    this.send('lookupDOI');
  },
  showDOIasValid() {
    this.set('validDOI', 'form-control is-valid');
    $('.ember-power-select-trigger').css('border-color', '#4dbd74');
    this.set('validTitle', 'form-control is-valid');
    this.set('model.newSubmission.metadata', '[]');
    this.set('isValidDOI', true);
    toastr.remove();
    toastr.success('We have pre populated information from the DOI provided');
  },
  showDOIasInvalid() {
    this.set('validDOI', 'form-control is-invalid');
    this.set('isValidDOI', false);
  },
  actions: {
    validateNext() {
      const title = this.get('model.publication.title');
      const journal = this.get('model.publication.journal');
      let validTitle = false;
      let validJournal = false;

      if (journal.get('journalName') == null) {
        toastr.remove();
        toastr.warning('The journal must not be left blank');
        validJournal = false;
        $('.ember-power-select-trigger').css('border-color', '#f86c6b');
      } else {
        validJournal = true;
        $('.ember-power-select-trigger').css('border-color', '#4dbd74');
      }

      if (title == null) {
        toastr.remove();
        toastr.warning('The title must not be left blank');
        this.set('validTitle', 'form-control is-invalid');
        validTitle = false;
      } else if (title.length > 3) {
        validTitle = true;
        this.set('validTitle', 'form-control is-valid');
      } else {
        toastr.remove();
        toastr.warning('Title must be longer then 3 characters');
        validTitle = false;
        this.set('validTitle', 'form-control is-invalid');
      }

      if (validTitle && validJournal) {
        this.send('next');
      }
    },
    next() {
      if (this.get('doiInfo').length === 0) {
        this.set('doiInfo', {
          'container-title': this.get('model.publication.journal.journalName'),
          title: this.get('model.publication.title')
        });
      }
      this.sendAction('next');
    },
    validateDOI() {
      // ref: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
      // const doi = this.get('model.publication.doi');
      // const newDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
      // const ancientDOIRegExp = /^(https?:\/\/(dx\.)?doi\.org\/)?10.1002\/[^\s]+$/i;
      // // 0 = no value
      // if (doi == null || !doi) {
      //   this.set('validDOI', 'form-control');
      //   this.set('isValidDOI', false);
      // } else if (newDOIRegExp.test(doi) === true || ancientDOIRegExp.test(doi) === true) { // 1 - Accepted
      //   this.showDOIasValid();
      // } else {
      //   this.showDOIasInvalid();
      // }
    },
    validateTitle() {
      const title = this.get('model.publication.title');
      this.set('validTitle', title == null || title.length > 5);
      // if(validTitle)
      if (title == null) {
        this.set('validTitle', 'form-control');
      } else if (title.length > 3) {
        this.set('validTitle', 'form-control is-valid');
      } else {
        this.set('validTitle', 'form-control is-invalid');
      }
    },
    /** looks up the DIO and returns title and journal if avaiable */
    lookupDOI(event) {
      const keycode = event ? event.keyCode : '';
      if (keycode === 16 || keycode === 17 || keycode === 18) {
        return; // Don't lookup for these keys as they don't directly change the input...
      }

      if (this.get('model.publication.doi')) {
        this.set('model.publication.doi', this.get('model.publication.doi').trim());
        this.set('model.publication.doi', this.get('model.publication.doi').replace(/doi:/gi, ''));
        this.set('model.publication.doi', this.get('model.publication.doi').replace(/https?:\/\/(dx\.)?doi\.org\//gi, ''));
      }
      const publication = this.get('model.publication');
      if (publication) {
        this.send('validateDOI');
        this.set('doiJournal', false);
        resolve(publication).then((doiInfo) => {
          if (doiInfo.isDestroyed) {
            return;
          }
          this.set('doiInfo', doiInfo);
          this.showDOIasValid();
          publication.set('title', doiInfo.title);

          publication.set('submittedDate', doiInfo.deposited);
          publication.set('creationDate', doiInfo.created);

          publication.set('issue', doiInfo.issue);
          publication.set('volume', doiInfo.volume);
          publication.set('abstract', doiInfo.abstract);

          const desiredName = doiInfo['container-title'].trim();
          const desiredIssn = Array.isArray(doiInfo['ISSN']) ? doiInfo['ISSN'][0] : // eslint-disable-line
            (doiInfo['ISSN'] ? doiInfo['ISSN'] : ''); // eslint-disable-line

          let query = {
            bool: {
              should: [{ match: { journalName: desiredName } }],
              // must: { term: { issns: desiredIssn } }
            }
          };
          if (desiredIssn) {
            query.bool.must = { term: { issns: desiredIssn } };
          }
          // Must match ISSN, optionally match journalName
          this.get('store').query('journal', { query }).then((journals) => {
            let journal = journals.get('length') > 0 ? journals.objectAt(0) : false;
            if (!journal) {
              console.log(` >>> Journal not found [${desiredIssn}] ${desiredName}`);
              const newJournal = this.get('store').createRecord('journal', {
                journalName: doiInfo['container-title'].trim(),
                issns: doiInfo.ISSN,
                nlmta: 'UNKNOWN',
              });
              newJournal.save().then(j => publication.set('journal', j));
            } else {
              publication.set('journal', journal);
            }
          });
        }).catch((error) => {
          if (error.response) {
            this.showDOIasInvalid();
            if (error.response) {
              toastr.remove();
              toastr.error(`${error.response.statusText} : ${error.response.url}`);
            }
          }
        });
      }
    },

    /** Sets the selected journal for the current publication.
     * @param journal {DS.Model} The journal
     */
    selectJournal(journal) {
      const publication = this.get('model.publication');
      publication.set('journal', journal);
      $('.ember-power-select-trigger').css('border-color', '#4dbd74');
    },
  },
});
