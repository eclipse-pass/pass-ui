import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import swal from 'sweetalert2/dist/sweetalert2.js';
import ENV from 'pass-ui/config/environment';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type SubmissionModel from 'pass-ui/models/submission';
import type UserModel from 'pass-ui/models/user';

const eq = (a: unknown, b: unknown) => a === b;
const and = (...args: unknown[]) => args.every(Boolean);

interface SubmissionActionCellSignature {
  Args: {
    record: SubmissionModel;
  };
}

export default class SubmissionActionCell extends Component<SubmissionActionCellSignature> {
  @service declare currentUser: CurrentUserService;
  @service declare submissionHandler: SubmissionHandlerService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;

  get isPreparer(): boolean {
    const userId = this.currentUser.user.id;
    const preparers = this.args.record.preparers;
    return preparers.map((x: UserModel) => x.id).includes(userId);
  }

  get isSubmitter(): boolean {
    return this.currentUser.user?.id === this.args.record.submitter?.id;
  }

  get submissionIsDraft(): boolean {
    return this.args.record.isDraft;
  }

  @action
  deleteSubmission(submission: SubmissionModel) {
    swal
      .fire({
        target: ENV.APP.rootElement,
        text: 'Are you sure you want to delete this draft submission? This cannot be undone.',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#DC3545',
        showCancelButton: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((result: any) => {
        if (result.value) {
          this.do_delete(submission);
        }
      });
  }

  async do_delete(submission: SubmissionModel) {
    try {
      await this.submissionHandler.deleteSubmission(submission);
    } catch (e) {
      this.flashMessages.danger(
        'We encountered an error deleting this draft submission. Please try again later or contact your administrator',
      );
    }
  }

  <template>
    {{! template-lint-disable link-href-attributes no-invalid-interactive }}
    {{#if @record.isStub}}
      <LinkTo
        @route='submissions.new'
        @query={{hash submission=@record.id}}
        class='btn btn-outline-primary text-nowrap'
      >
        Finish submission
      </LinkTo>
    {{else if (and (eq @record.submissionStatus 'changes-requested') this.isSubmitter)}}
      <span class='cell-span'><i>Awaiting changes. No actions available.</i></span>
    {{else if (and (eq @record.submissionStatus 'changes-requested') this.isPreparer)}}
      <LinkTo @route='submissions.new' @query={{hash submission=@record.id}} class='btn btn-outline-primary'>
        Edit submission
      </LinkTo>
    {{else if (and (eq @record.submissionStatus 'approval-requested') this.isSubmitter)}}
      <LinkTo @route='submissions.detail' @model={{@record.id}} class='btn btn-outline-primary'>
        Review submission
      </LinkTo>
    {{else if (and (eq @record.submissionStatus 'approval-requested') this.isPreparer)}}
      <span class='cell-span'><i>Awaiting approval. No actions available.</i></span>
    {{else if (and (eq @record.submissionStatus 'needs-attention') this.isSubmitter)}}
      <LinkTo @route='submissions.detail' @model={{@record.id}} class='btn btn-outline-primary'>
        Review submission
      </LinkTo>
    {{else if this.submissionIsDraft}}
      <LinkTo @route='submissions.new' @query={{hash submission=@record.id}} class='btn btn-outline-primary w-100 mb-2'>
        Edit
      </LinkTo>
      <a
        class='btn btn-outline-danger text-danger w-100 delete-button'
        {{on 'click' (fn this.deleteSubmission @record)}}
      >
        Delete
      </a>
    {{else}}
      <span class='cell-span'><i>No actions available.</i></span>
    {{/if}}
  </template>
}
