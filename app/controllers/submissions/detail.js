import Controller from '@ember/controller';
import _ from 'lodash';

export default Controller.extend({
  // statusService: Ember.inject.service('submission-status'),

  tooltips: function () {
    $(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }.on('init'),

  // status: Ember.computed('model.sub', 'model.repoCopies', 'model.deposits', function () {
  //   return this.get('statusService').calculateStatus(
  //     this.get('model.sub'),
  //     this.get('model.repoCopies'),
  //     this.get('model.deposits')
  //   );
  // }),

  externalSubmission: Ember.computed('metadataBlobNoKeys', function () {
    return this.get('metadataBlobNoKeys').Submission;
  }),
  /**
   * Ugly way to generate date for the template to use.
   * {
   *    'repository-id': {
   *      repo: { }, // repository obj
   *      deposit: {}, // related deposit, if exists
   *      repositoryCopy: {} // related repoCopy if exists
   *    }
   * }
   * This map is then turned into an array for use in the template
   */
  repoMap: Ember.computed('model.deposits', 'model.repoCopies', function () {
    let hasStuff = false;
    const repos = this.get('model.repos');
    const deps = this.get('model.deposits');
    const repoCopies = this.get('model.repoCopies');

    let map = {};
    repos.forEach(r => map[r.get('id')] = { repo: r }); // eslint-disable-line

    if (deps) {
      deps.forEach((deposit) => {
        hasStuff = true;
        const repo = deposit.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            deposit
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], {
            deposit,
            repositoryCopy: deposit.get('repositoryCopy')
          });
        }
      });
    }
    if (repoCopies) {
      hasStuff = true;
      repoCopies.forEach((rc) => {
        const repo = rc.get('repository');
        if (!map.hasOwnProperty(repo.get('id'))) {
          map[repo.get('id')] = {
            repo,
            repositoryCopy: rc
          };
        } else {
          map[repo.get('id')] = Object.assign(map[repo.get('id')], { repositoryCopy: rc });
        }
      });
    }
    if (hasStuff) {
      let results = [];
      Object.keys(map).forEach(k => results.push(map[k]));
      return results;
    }

    return null;
  }),
  metadataBlobNoKeys: Ember.computed('model.sub.metadata', function () {
    let metadataBlobNoKeys = [];
    JSON.parse(this.get('model.sub.metadata')).forEach((ele) => {
      for (var key in ele.data) {
        if (ele.data.hasOwnProperty(key)) {
          let strippedData;
          strippedData = ele.data[key];
          if (key === 'authors') {
            if (metadataBlobNoKeys['author(s)']) {
              metadataBlobNoKeys['author(s)'] = _.uniqBy(metadataBlobNoKeys['author(s)'].concat(strippedData), 'author');
            } else {
              metadataBlobNoKeys['author(s)'] = strippedData;
            }
          } else {
            metadataBlobNoKeys[key] = strippedData;
          }
        }
      }
    });

    for (var key in metadataBlobNoKeys) {
      if (metadataBlobNoKeys.hasOwnProperty(key)) {
        metadataBlobNoKeys[_.capitalize(key)] = metadataBlobNoKeys[key];
        delete metadataBlobNoKeys[key];
      }
    }
    return metadataBlobNoKeys;
  }),
});
