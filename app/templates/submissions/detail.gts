import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { Textarea } from '@ember/component';
import formatDate from 'pass-ui/helpers/format-date';
import SubmissionStatus from 'pass-ui/components/submission-status';
import SubmissionRepoDetails from 'pass-ui/components/submission-repo-details';
import DisplayMetadataKeys from 'pass-ui/components/display-metadata-keys';
import CommentingBlock from 'pass-ui/components/commenting-block';
import type SubmissionsDetail from 'pass-ui/controllers/submissions/detail';

const eq = (a: unknown, b: unknown) => a === b;
const or = (...args: unknown[]) => args.some(Boolean);
const and = (...args: unknown[]) => args.every(Boolean);

interface Signature {
  Args: {
    controller: SubmissionsDetail;
  };
}

// prettier-ignore
<template>
  {{! template-lint-disable link-rel-noopener require-button-type require-input-label }}
  <div class='block-user-input text-center'>
    <div class='lds-dual-ring mx-auto'></div>
  </div>
  <div id='submission-details-title' class='d-flex justify-content-between align-items-center my-3'>
    <div class='d-flex align-items-center'>
      <LinkTo @route='submissions' class='btn btn-small back-arrow mr-1' aria-label='Go back to the previous page'>
        <i class='fa fa-arrow-left fa-lg'></i>
      </LinkTo>
      <h1 class='font-weight-light m-0'>
        Submission Detail
      </h1>
    </div>
    <div class='col-6 text-end'>
      {{#if @controller.model.sub.isStub}}
        <LinkTo
          @route='submissions.new'
          @query={{hash submission=@controller.model.sub.id}}
          class='btn btn-outline-primary text-end text-nowrap'
        >
          Finish submission
        </LinkTo>
      {{else if @controller.model.sub.isDraft}}
        <LinkTo
          @route='submissions.new'
          @query={{hash submission=@controller.model.sub.id}}
          class='btn btn-outline-primary text-end'
          data-test-submission-detail-edit-submission
        >
          Edit submission
        </LinkTo>
        <button
          class='btn btn-outline-danger text-end'
          type='button'
          {{on 'click' (fn @controller.deleteSubmission @controller.model.sub)}}
        >
          Delete
        </button>
      {{/if}}
    </div>
  </div>
  <div id='submission-details-body' class='mb-3 row'>
    <div class='col-12'>
      <div class='list-group'>
        {{! @glint-expect-error - href attribute on div element, legacy HTML }}
        <div href='#' class='list-group-item flex-column align-items-start'>
          <div class='submission-details-title border-bottom d-flex flex-column w-100'>
            <div class='d-flex w-100 justify-content-between'>
              <h5 class='mb-1'>
                {{@controller.model.sub.publication.title}}
              </h5>
              {{#if @controller.model.sub.submittedDate}}
                <small class='text-muted text-end'>
                  Submitted
                  {{formatDate @controller.model.sub.submittedDate}}
                </small>
              {{/if}}
            </div>
            <p class='mb-1'>
              DOI:
              {{#if @controller.model.sub.publication.doi}}
                {{@controller.model.sub.publication.doi}}
              {{else}}
                <span class='text-muted'>
                  None
                </span>
              {{/if}}
            </p>
          </div>
          <table class='table table-responsive-sm table-bordered w-100 d-flex'>
            <tbody>
              <tr>
                <td>
                  <strong>
                    Submission status
                  </strong>
                </td>
                <td>
                  <SubmissionStatus @submissionStatus={{@controller.model.sub.submissionStatus}} />
                </td>
              </tr>
              {{#if @controller.model.sub.isCovid}}
                <tr class='font-weight-bold'>
                  <td></td>
                  <td>
                    <div data-test-submission-detail-covid>
                      This submission was marked as pertaining to COVID-19 research
                      <a href='/faq.html#covid-19' target='_blank'>
                        (What does this mean?)
                      </a>
                    </div>
                  </td>
                </tr>
              {{/if}}
              <tr>
                <td>
                  <strong>
                    Grants
                  </strong>
                </td>
                <td>
                  <ul class='list-unstyled'>
                    {{#each @controller.model.sub.grants as |grant|}}
                      <li class='grant-item' data-test-submission-detail-grant>
                        <b>
                          {{grant.awardNumber}}
                        </b>
                        :
                        {{grant.projectName}}
                      </li>
                      <li class='grant-item' data-test-submission-detail-funder>
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
              {{#if @controller.repoMap}}
                <tr>
                  <td class='text-nowrap'>
                    <strong>
                      Repositories
                    </strong>
                  </td>
                  <td>
                    <ul class='list-unstyled'>
                      {{#each @controller.repoMap as |repoInfo|}}
                        <SubmissionRepoDetails
                          @repo={{repoInfo.repo}}
                          @deposit={{repoInfo.deposit}}
                          @repoCopy={{repoInfo.repositoryCopy}}
                          @submission={{@controller.model.sub}}
                        />
                      {{/each}}
                    </ul>
                  </td>
                </tr>
              {{/if}}
              {{#if @controller.externalSubmission}}
                <tr>
                  <td>
                    <strong>
                      External Submission Repositories
                    </strong>
                  </td>
                  <td>
                    <ul class='list-unstyled'>
                      {{#each @controller.externalSubmission as |sub|}}
                        <li>
                          {{sub.message}}
                        </li>
                      {{/each}}
                    </ul>
                  </td>
                </tr>
              {{/if}}
              <tr>
                <td class='text-nowrap'>
                  <strong>
                    Submitter
                  </strong>
                </td>
                <td data-test-submission-detail-submitter>
                  {{#if (eq @controller.model.sub.source 'other')}}
                    <i>
                      This submission did not originate from PASS
                    </i>
                  {{else if @controller.displaySubmitterName}}
                    {{@controller.displaySubmitterName}}
                  {{/if}}
                  {{#if @controller.displaySubmitterEmail}}
                    &nbsp;(
                    <a href='mailto:{{@controller.displaySubmitterEmail}}'>
                      {{@controller.displaySubmitterEmail}}
                    </a>
                    )
                  {{/if}}
                </td>
              </tr>
              {{#if @controller.model.sub.preparers}}
                <tr>
                  <td class='text-nowrap'>
                    <strong>
                      Preparer(s)
                    </strong>
                  </td>
                  <td data-test-submission-detail-preparer>
                    {{#each @controller.model.sub.preparers as |preparer index|}}
                      {{#if index}}
                        ,
                      {{/if}}
                      {{preparer.displayName}}
                      {{#if preparer.email}}
                        &nbsp;(
                        <a href='mailto:{{preparer.email}}'>
                          {{preparer.email}}
                        </a>
                        )
                      {{/if}}
                    {{/each}}
                  </td>
                </tr>
              {{/if}}
              {{#if @controller.mustVisitWeblink}}
                <tr>
                  <td id='externalSubmission'>
                    <strong>
                      External Submission Required
                    </strong>
                    <br />
                    {{#if @controller.disableSubmit}}
                      <i class='fa fa-exclamation-triangle fa-2x mt-3 ml-3 notice-triangle'></i>
                    {{/if}}
                  </td>
                  <td>
                    <label class=''>
                      Please visit the following web portal to submit your manuscript directly. Metadata displayed
                      above could be used to aid in your submission progress.
                    </label>
                    <ul class='m-0'>
                      {{#each @controller.weblinkRepos as |repo|}}
                        <li>
                          <button
                            type='button'
                            class='btn btn-link'
                            {{on 'click' (fn @controller.openWeblinkAlert repo)}}
                          >
                            {{repo.url}}
                          </button>
                        </li>
                      {{/each}}
                    </ul>
                  </td>
                </tr>
              {{/if}}
              <tr>
                <td>
                  <strong>
                    Details
                  </strong>
                </td>
                <td>
                  <DisplayMetadataKeys @submission={{@controller.model.sub}} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>
                    Files
                  </strong>
                </td>
                <td>
                  {{#if (eq @controller.model.sub.source 'other')}}
                    <p class='mb-0'>
                      <i>
                        We do not have a copy of manuscript files because this submission did not originate from PASS
                      </i>
                    </p>
                  {{else}}
                    <table class='files-table w-100'>
                      <thead class='border-bottom border-top'>
                        <tr>
                          <th scope='col'></th>
                          <th scope='col' class='font-weight-light'>
                            Name
                          </th>
                          <th scope='col' class='font-weight-light'>
                            Type
                          </th>
                          <th scope='col' class='font-weight-light'>
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {{#each @controller.submissionFiles as |file|}}
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
                            <td id='submissions-detail-file-cell' data-label='name'>
                              <a href={{file.uri}}>
                                {{file.name}}
                              </a>
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
                  {{/if}}
                </td>
              </tr>
              {{#if (or @controller.isPreparer @controller.isSubmitter)}}
                <tr>
                  <td class='text-nowrap'>
                    <strong>
                      Comments
                    </strong>
                  </td>
                  <td>
                    <CommentingBlock @submissionEvents={{@controller.model.submissionEvents}} />
                    {{#if
                      (or
                        (and @controller.isSubmitter @controller.submissionNeedsSubmitter)
                        (and @controller.isPreparer @controller.submissionNeedsPreparer)
                      )
                    }}
                      <Textarea
                        placeholder='Add comment'
                        @value={{@controller.message}}
                        class='form-control custom-control p-2 submissions-detail-comment-textarea'
                        rows='2'
                      />
                    {{/if}}
                  </td>
                </tr>
              {{/if}}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  {{#if (and @controller.isSubmitter @controller.submissionNeedsSubmitter)}}
    <div class='row'>
      <div class='col-12 text-end'>
        <button class='btn btn-primary' type='button' {{on 'click' @controller.approveChanges}}>
          Submit
        </button>
        <button class='btn btn-outline-primary' type='button' {{on 'click' @controller.requestMoreChanges}}>
          Request More Changes
        </button>
        <LinkTo
          @route='submissions.new'
          @query={{hash submission=@controller.model.sub.id}}
          class='btn btn-outline-primary'
        >
          Edit Submission
        </LinkTo>
        <button class='btn btn-danger' type='button' {{on 'click' @controller.cancelSubmission}}>
          Cancel Submission
        </button>
      </div>
    </div>
  {{/if}}
  {{#if (and @controller.isPreparer @controller.submissionNeedsPreparer)}}
    <div class='row'>
      <div class='col-12 text-end'>
        <LinkTo @route='submissions.new' @query={{hash submission=@controller.model.sub.id}} class='btn btn-primary'>
          Edit this submission
        </LinkTo>
      </div>
    </div>
  {{/if}}
</template> satisfies TemplateOnlyComponent<Signature>
