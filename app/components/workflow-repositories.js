import Component from '@ember/component';
import { inject as service, } from '@ember/service';

export default Component.extend({
  workflow: service('workflow'),

  willRender() {
    this._super(...arguments);

    // const currentRepos = this.get('submission.repositories');
    // if (currentRepos && currentRepos.length > 0) {
    //   /**
    //    * Check returned repositories against any repositories already set in the current submission.
    //    * Make sure all repositories present in the submission have `selected: true` in the returned
    //    * lists.
    //    */
    //   this.get('optionalRepositories').forEach((opt) => {
    //     if (currentRepos.isAny('id', opt.repository.get('id'))) {
    //       opt.selected = true;
    //     } else {
    //       opt.selected = false;
    //     }
    //   });
    // } else {
    //   /**
    //    * If no repositories have been saved to the submission yet, force add all required repositories
    //    * as well as any other repositories marked as 'selected
    //    */

    // }
  },

  actions: {
    addRepository(repositoryToAdd) {
      let submissionIncludesRepo = this.get('submission.repositories').includes(repositoryToAdd);
      if (!submissionIncludesRepo) {
        this.get('submission.repositories').pushObject(repositoryToAdd);
      }
      this.get('workflow').setMaxStep(4);
    },
    removeRepository(repositoryToRemove) {
      let addedRepos = this.get('submission.repositories');
      let updatedRepos = Ember.A();
      addedRepos.forEach((repository) => {
        if (repositoryToRemove.get('id') !== repository.get('id')) {
          updatedRepos.pushObject(repository);
        }
      });
      this.set('submission.repositories', updatedRepos);
      this.get('workflow').setMaxStep(4);
    },
    toggleRepository(repository) {
      if (event.target.checked) this.send('addRepository', repository);
      else this.send('removeRepository', repository);
    },
    cancel() {
      this.sendAction('abort');
    }
  }
});
