/* eslint-disable ember/no-get */
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import swal from 'sweetalert2';

export default class SubmissionActionCell extends Component {
  @service currentUser;
  @service submissionHandler;
  @service flashMessages;

  get isPreparer() {
    let userId = this.currentUser.user.id;
    let preparers = this.args.record.preparers;
    return preparers.map((x) => x.id).includes(userId);
  }

  get isSubmitter() {
    return get(this, 'currentUser.user.id') === get(this, 'args.record.submitter.id');
  }

  get submissionIsDraft() {
    return this.args.record.isDraft;
  }

  /**
   * Delete the specified submission record. This is done via #destroyRecord
   * so is immediately persisted
   *
   * @param {object} submission model object to be removed
   */
  @action
  deleteSubmission(submission) {
    swal({
      text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
      confirmButtonText: 'Delete',
      confirmButtonColor: '#DC3545',
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        this.do_delete(submission);
      }
    });
  }

  async do_delete(submission) {
    try {
      await this.submissionHandler.deleteSubmission(submission);
    } catch (e) {
      this.flashMessages.danger(
        'We encountered an error deleting this draft submission. Please try again later or contact your administrator',
      );
    }
  }
}
