/* eslint-disable ember/no-get */

import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import swal from 'sweetalert2';

export default class SubmissionActionCell extends Component {
  @service currentUser;
  @service submissionHandler;

  get isPreparer() {
    let userId = this.currentUser.user.id;
    let preparers = this.args.record.preparers;
    return preparers.map(x => x.id).includes(userId);
  }

  get isSubmitter() {
    return get(this, 'currentUser.user.id') === get(this, 'args.record.submitter.id');
  }

  get submissionIsDraft() {
    return this.args.record.isDraft;
  }

  /**
   * Delete the specified submission record from Fedora.
   *
   * Note: `ember-fedora-adapter#deleteRecord` behaves like `ember-data#destroyRecord`
   * in that the deletion is pushed to the back end automatically, such that a
   * subsequent 'save()' will fail.
   *
   * @param {object} submission model object to be removed
   */
  @action
  deleteSubmission(submission) {
    swal({
      // title: 'Are you sure?',
      text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
      confirmButtonText: 'Delete',
      confirmButtonColor: '#f86c6b',
      showCancelButton: true,
      // buttonsStyling: false,
      // confirmButtonClass: 'btn btn-danger',
      // cancelButtonText: 'No',
      // customClass: {
      //   confirmButton: 'btn btn-danger'
      // }
    }).then((result) => {
      if (result.value) {
        this.submissionHandler.deleteSubmission(submission);
      }
    });
  }
}
