import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { later } from '@ember/runloop';
import { on } from '@ember/modifier';
import { Textarea } from '@ember/component';
import { modifier } from 'ember-modifier';
import ENV from 'pass-ui/config/environment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import swal from 'sweetalert2/dist/sweetalert2.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import FlashMessage from 'ember-cli-flash/components/flash-message';
import ExternalRepoReview from 'pass-ui/components/external-repo-review';
import CommentingBlock from 'pass-ui/components/commenting-block';
import DisplayMetadataKeys from 'pass-ui/components/display-metadata-keys';
import type Workflow from 'pass-ui/services/workflow';
import type CurrentUserService from 'pass-ui/services/current-user';
import type SubmissionHandlerService from 'pass-ui/services/submission-handler';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type RepositoryModel from 'pass-ui/models/repository';
import type { WorkflowFile } from 'pass-ui/services/workflow';

interface ReviewFile extends WorkflowFile {
  submission: { id: string };
  mimeType: string;
  fileRole: string;
  description: string;
}

const eq = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perform =
  (task: any) =>
  (...args: any[]) =>
    task.perform(...args);

interface RepoAgreementStep {
  id: string;
  title?: string;
  html?: string;
}

interface WorkflowReviewSignature {
  Args: {
    submission: SubmissionModel;
    publication: PublicationModel;
    comment: string;
    uploading: boolean;
    waitingMessage: string;
    submitSubmission: () => void;
    back: () => void;
    abort: () => void;
  };
}

export default class WorkflowReview extends Component<WorkflowReviewSignature> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;
  @service declare workflow: Workflow;
  @service declare currentUser: CurrentUserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  @service declare submissionHandler: SubmissionHandlerService;

  @tracked isValidated: unknown[] = [];
  @tracked hasVisitedWeblink = false;
  @tracked repositories: RepositoryModel[] = this.args.submission.repositories;

  get parsedFiles(): ReviewFile[] {
    return this.workflow
      .getFiles()
      .filter((file: WorkflowFile) => (file as ReviewFile).submission?.id === this.args.submission.id) as ReviewFile[];
  }

  get weblinkRepos() {
    return this.repositories.filter((repo: RepositoryModel) => repo._isWebLink);
  }

  get mustVisitWeblink(): boolean {
    const weblinkExists = this.weblinkRepos.length > 0;
    const isSubmitter = this.currentUser.user?.id === this.args.submission.submitter?.id;
    return weblinkExists && isSubmitter;
  }

  get disableSubmit(): boolean {
    const needsToVisitWeblink = this.mustVisitWeblink && !this.hasVisitedWeblink;
    return this.args.uploading || needsToVisitWeblink;
  }

  get userIsPreparer(): boolean {
    const isNotSubmitter = this.args.submission.submitter?.id !== this.currentUser.user?.id;
    return this.args.submission.isProxySubmission && isNotSubmitter;
  }

  get submitButtonText(): string {
    return this.userIsPreparer ? 'Request approval' : 'Submit';
  }

  unblockUserInput() {
    const elements = document.querySelectorAll('.block-user-input');
    elements.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
  }

  @action
  onAllExternalReposClicked() {
    this.hasVisitedWeblink = true;
  }

  submitTask = task(async () => {
    document.querySelectorAll('.block-user-input').forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });

    let disableSubmit = true;
    if (this.disableSubmit) {
      if (!this.hasVisitedWeblink) {
        this.submissionHandler.setLinkVisited(false);

        later(() => {
          this.submissionHandler.setLinkVisited(true);
        }, 4000);
        this.flashMessages.warning(
          'Please visit the following web portal to submit your manuscript directly. Metadata displayed above could be used to aid in your submission progress.',
        );
      }
      disableSubmit = false;
    }

    if (!disableSubmit) {
      this.unblockUserInput();
      return;
    }

    if (this.args.submission.submitter?.id !== this.currentUser.user?.id) {
      this.args.submitSubmission();
      return;
    }

    const repos = this.args.submission.repositories;
    if (repos.length === 0) {
      swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: 'No repositories are associated with this submission. \n Return to the submission and edit it to include a repository.',
        confirmButtonText: 'Ok',
      });
      this.unblockUserInput();
      return;
    }

    let reposWithAgreementText: RepoAgreementStep[] = repos
      .filter((repo: RepositoryModel) => !repo._isWebLink && repo.agreementText)
      .map((repo: RepositoryModel) => ({
        id: repo.name,
        title: `Deposit requirements for ${repo.name}`,
        html: `<div class="form-control deposit-agreement-content py-4 mt-4">${repo.agreementText}</div>`,
      }));

    let reposWithoutAgreementText: RepoAgreementStep[] = repos
      .filter((repo: RepositoryModel) => !repo._isWebLink && !repo.agreementText)
      .map((repo: RepositoryModel) => ({
        id: repo.name,
      }));

    let reposWithWebLink: RepoAgreementStep[] = repos
      .filter((repo: RepositoryModel) => repo._isWebLink)
      .map((repo: RepositoryModel) => ({
        id: repo.name,
      }));

    const reposProgressSteps = reposWithAgreementText.map((_repo: RepoAgreementStep, index: number) => index);
    const Queue = swal.mixin({
      target: ENV.APP.rootElement,
      confirmButtonText: 'Next &rarr;',
      input: 'radio',
      inputOptions: {
        agree: `I agree to the above statement on today's date.`,
        noAgree:
          'I do not agree to the above statement and I understand that if I proceed and do not check this box, my submission will not be deposited to the above repository.',
      },
      inputValidator: (value: string | null) => {
        if (!value) {
          return 'You need to choose something!';
        }
      },
      progressSteps: reposProgressSteps.map((index: number) => '' + (index + 1)),
    });
    const result: { value: (string | undefined)[] } = { value: [] };
    for (const repoStep of reposProgressSteps) {
      const repoState = reposWithAgreementText[repoStep];
      if (!repoState) continue;
      const repoResult = await Queue.fire({
        currentProgressStep: repoStep,
        title: repoState.title,
        html: repoState.html,
      });
      result.value.push(repoResult.value);
    }
    const validResults = result.value.some((agree: string | undefined) => agree !== undefined);
    if (!validResults && reposWithAgreementText.length > 0) {
      this.unblockUserInput();
      return;
    }
    let reposThatUserAgreedToDeposit = reposWithAgreementText.filter((_repo: RepoAgreementStep, index: number) => {
      if (result.value[index] === 'agree') {
        return true;
      }
    });
    if (
      reposWithoutAgreementText.length > 0 ||
      reposThatUserAgreedToDeposit.length > 0 ||
      reposWithWebLink.length > 0
    ) {
      let swalMsg =
        'Once you click confirm you will no longer be able to edit this submission or add repositories.<br/>';
      if (reposWithoutAgreementText.length > 0 || reposThatUserAgreedToDeposit.length) {
        swalMsg = `${swalMsg}You are about to submit your files to: <pre><code>${JSON.stringify(
          reposThatUserAgreedToDeposit.map((repo: RepoAgreementStep) => repo.id),
        ).replace(/[\[\]']/g, '')}${JSON.stringify(
          reposWithoutAgreementText.map((repo: RepoAgreementStep) => repo.id),
        ).replace(/[\[\]']/g, '')} </code></pre>`;
      }
      if (reposWithWebLink.length > 0) {
        swalMsg = `${swalMsg}You were prompted to submit to: <code><pre>${JSON.stringify(
          reposWithWebLink.map((repo: RepoAgreementStep) => repo.id),
        ).replace(/[\[\]']/g, '')}</code></pre>`;
      }

      const resultConfirm = await swal.fire({
        target: ENV.APP.rootElement,
        title: 'Confirm submission',
        html: swalMsg,
        confirmButtonText: 'Confirm',
        showCancelButton: true,
      });

      if (resultConfirm.value) {
        const repos = this.args.submission.repositories;

        const filteredRepos = repos.filter((repo: RepositoryModel) => {
          if (repo._isWebLink) {
            return true;
          }
          let temp = reposWithAgreementText.map((x: RepoAgreementStep) => x.id).includes(repo.name);
          if (!temp) {
            return true;
          } else if (reposThatUserAgreedToDeposit.map((r: RepoAgreementStep) => r.id).includes(repo.name)) {
            return true;
          }
          return false;
        });

        this.args.submission.repositories = filteredRepos;

        this.args.submitSubmission();
      } else {
        this.unblockUserInput();
      }
    } else {
      let reposUserDidNotAgreeToDeposit = reposWithAgreementText.filter((repo: RepoAgreementStep) => {
        if (!reposThatUserAgreedToDeposit.includes(repo)) {
          return true;
        }
      });
      swal.fire({
        target: ENV.APP.rootElement,
        title: 'Your submission cannot be submitted.',
        html: `You declined to agree to the deposit agreement(s) for ${JSON.stringify(
          reposUserDidNotAgreeToDeposit.map((repo: RepoAgreementStep) => repo.id),
        ).replace(/[\[\]']/g, '')}. Therefore, this submission cannot be submitted.`,
        confirmButtonText: 'Ok',
      });
      this.unblockUserInput();
    }
  });

  initTooltip = modifier(() => {
    const el = document.querySelector('[data-toggle="tooltip"]') as (Element & { tooltip?: () => void }) | null;
    if (el && el.tooltip) {
      el.tooltip();
    }
  });

  @action
  back() {
    this.args.back();
  }

  @action
  cancel() {
    this.args.abort();
  }

  <template>
    {{! template-lint-disable no-inline-styles require-button-type require-input-label }}
    <div class='mb-3 row' {{this.initTooltip}}>
      {{#each this.flashMessages.queue as |flash|}}
        <div class='flash-message-container'>
          <FlashMessage @flash={{flash}} as |component flash close|>
            <div class='d-flex justify-content-between'>
              {{flash.message}}
              <span role='button' {{on 'click' close}}>
                x
              </span>
            </div>
          </FlashMessage>
        </div>
      {{/each}}
      <div class='col-md-12'>
        <div class='list-group'>
          {{! @glint-expect-error - href attribute on div element, legacy HTML }}
          <div href='#' class='list-group-item flex-column align-items-start'>
            <div class='review-step-title d-flex flex-column w-100 border-bottom pb-2'>
              <div class='d-flex flex-row w-100 justify-content-between'>
                <h4 class='mb-1' data-test-workflow-review-title>
                  {{@publication.title}}
                </h4>
                <small class='text-muted'>
                  {{! @glint-ignore - dateSubmitted is a legacy template property }}
                  {{@submission.dateSubmitted.date-time}}<br />
                  {{! @glint-ignore - dateCreated is a legacy template property }}
                  {{@submission.dateCreated.date-time}}
                </small>
              </div>
              <p class='mb-1' data-test-workflow-review-doi>
                {{@publication.doi}}
              </p>
              <div class='text-muted'>
                Please review the information below
              </div>
            </div>
            <table id='review-step-table' class='table table-responsive-sm w-100'>
              <tbody>
                {{#if this.mustVisitWeblink}}
                  <ExternalRepoReview
                    @repos={{this.weblinkRepos}}
                    @onAllExternalReposClicked={{this.onAllExternalReposClicked}}
                  />
                {{/if}}

                <tr>
                  <td class='max-width'>
                    Repositories
                  </td>
                  <td>
                    <p>
                      Submission into these repositories is required according to the respective policies.
                    </p>
                    <ul class='m-0 list-unstyled' data-test-workflow-review-repository-list>
                      {{#each @submission.repositories as |repository|}}
                        <li class='pl-3'>
                          {{repository.name}}
                        </li>
                      {{/each}}
                    </ul>
                  </td>
                </tr>

                <tr>
                  <td>
                    Grants
                  </td>
                  <td>
                    <ul class='list-unstyled' data-test-workflow-review-grant-list>
                      {{#each @submission.grants as |grant|}}
                        <li class='grant-item'>
                          <b>
                            {{grant.awardNumber}}
                          </b>
                          :
                          {{grant.projectName}}
                        </li>
                        <li class='grant-item'>
                          <b>
                            Funder
                          </b>
                          :
                          {{grant.primaryFunder.name}}
                        </li>
                      {{/each}}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    Details
                  </td>
                  <td>
                    <DisplayMetadataKeys @submission={{@submission}} />
                  </td>
                </tr>

                <tr>
                  <td>
                    Files
                  </td>
                  <td>
                    <table class='files-table w-100 border-bottom border-top'>
                      <thead>
                        <tr>
                          <th scope='col'>File Type</th>
                          <th scope='col' class='font-weight-light'>
                            Name
                          </th>
                          <th scope='col' class='font-weight-light'>
                            Manuscript/Supplement
                          </th>
                          <th scope='col' class='font-weight-light'>
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {{#each this.parsedFiles as |file|}}
                          <tr>
                            <td data-label='icon'>
                              {{#if (eq file.mimeType 'png')}}
                                <i class='fas fa-file-image line-height-35 text-gray fa-30'></i>
                              {{else if
                                (eq file.mimeType 'vnd.openxmlformats-officedocument.presentationml.presentation')
                              }}
                                <i class='fas fa-file-powerpoint line-height-35 text-gray fa-30'></i>
                              {{else if (eq file.mimeType 'msword')}}
                                <i class='fas fa-file-word line-height-35 text-gray fa-30'></i>
                              {{else if (eq file.mimeType 'pdf')}}
                                <i class='fas fa-file-pdf line-height-35 text-gray fa-30'></i>
                              {{else}}
                                <i class='far fa-file line-height-35 text-gray fa-30'></i>
                              {{/if}}
                            </td>
                            <td class='workflow-review-file-name' data-label='name' data-test-workflow-review-file-name>
                              {{file.name}}
                            </td>
                            <td data-label='type' class='text-nowrap'>
                              {{file.fileRole}}
                            </td>
                            <td data-label='description'>
                              {{file.description}}
                            </td>
                          </tr>
                        {{/each}}
                      </tbody>
                    </table>
                  </td>
                </tr>
                {{#if @submission.isProxySubmission}}
                  <tr>
                    <td>
                      Comments
                    </td>
                    <td>
                      <p data-test-workflow-review-submitter>
                        This submission is prepared on behalf of
                        {{#if @submission.submitter}}
                          {{@submission.submitter.displayName}}
                          (
                          <a href='mailto:{{@submission.submitter.email}}'>
                            {{@submission.submitter.email}}
                          </a>
                          )
                        {{else}}
                          {{@submission.submitterName}}
                          (
                          <a href='{{@submission.submitterEmail}}'>
                            {{@submission.submitterEmailDisplay}}
                          </a>
                          )
                        {{/if}}
                      </p>
                      {{#unless @submission.id}}
                        <p>
                          Once "Request approval" is clicked, a notification will be sent to
                          {{#if @submission.submitter.id}}
                            {{@submission.submitter.displayName}}
                            (
                            <a href='mailto:{{@submission.submitter.email}}'>
                              {{@submission.submitter.email}}
                            </a>
                            )
                          {{else}}
                            {{@submission.submitterName}}
                            (
                            <a href='{{@submission.submitterEmail}}'>
                              {{@submission.submitterEmailDisplay}}
                            </a>
                            )
                          {{/if}}
                          . The submission will be sent to its target repositories upon approval, or be sent back to you
                          if additional edits are requested by
                          {{@submission.submitter.displayName}}.
                        </p>
                      {{/unless}}
                      <hr />
                      <CommentingBlock @submissionEvents={{@submission.submissionEvents}} />
                      <Textarea
                        placeholder='Add comment'
                        @value={{@comment}}
                        class='form-control custom-control p-2 comment-text-area'
                        rows='2'
                      />
                    </td>
                  </tr>
                {{/if}}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <button class='btn btn-outline-primary' type='button' data-test-workflow-review-back {{on 'click' this.back}}>
      Back
    </button>
    <button class='btn btn-outline-danger ml-2' type='button' {{on 'click' this.cancel}}>
      Cancel
    </button>
    {{#if @uploading}}
      <button class='btn btn-primary pull-right submit' type='button' disabled>
        {{@waitingMessage}}
      </button>
    {{else if this.disableSubmit}}
      <button class='btn btn-primary pull-right submit' type='button' data-test-workflow-review-submit disabled>
        {{this.submitButtonText}}
      </button>
    {{else}}
      <button
        class='btn btn-primary pull-right submit'
        type='button'
        {{on 'click' (perform this.submitTask)}}
        data-test-workflow-review-submit
      >
        {{this.submitButtonText}}
      </button>
    {{/if}}
  </template>
}
