import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import ModelsTableServerPaginated from 'ember-models-table/components/models-table-server-paginated';
import formatDate from 'pass-ui/helpers/format-date';
import SubmissionsArticleCell from 'pass-ui/components/submissions-article-cell';
import SubmissionsAwardCell from 'pass-ui/components/submissions-award-cell';
import SubmissionsRepoCell from 'pass-ui/components/submissions-repo-cell';
import SubmissionsStatusCell from 'pass-ui/components/submissions-status-cell';
import SubmissionsRepoidCell from 'pass-ui/components/submissions-repoid-cell';
import SubmissionActionCell from 'pass-ui/components/submission-action-cell';
import DateCell from 'pass-ui/components/date-cell';
import type GrantDetailsController from 'pass-ui/controllers/grants/detail';

interface Signature {
  Args: {
    controller: GrantDetailsController;
  };
}

// prettier-ignore
<template>
  <div id='grant-details-title' class='d-flex justify-content-between align-items-center my-3'>
    <div class='d-flex align-items-center'>
      <LinkTo @route='grants' class='btn btn-small back-arrow mr-1' aria-label='Go back to the previous page'>
        <i class='fa fa-arrow-left fa-lg'></i>
      </LinkTo>
      <h1 class='font-weight-light m-0'>
        Grant Details
      </h1>
    </div>
    {{#if @controller.currentUser.user.isSubmitter}}
      <div>
        <LinkTo
          @route='submissions.new'
          @query={{hash grant=@controller.grant.id}}
          class='btn btn-primary btn-small pull-right'
        >
          Create new submission
        </LinkTo>
      </div>
    {{/if}}
  </div>
  <div id='grant-details-body' class='grant-details'>
    <div class='row'>
      <ul class='col-sm-6'>
        <li data-test-grants-detail-name>
          <strong>
            Project Name:
          </strong>
          {{@controller.grant.projectName}}
        </li>
        <li data-test-grants-detail-award-number>
          <strong>
            Award Number:
          </strong>
          {{@controller.grant.awardNumber}}
        </li>
        <li data-test-grants-detail-funder>
          <strong>
            Funder:
          </strong>
          {{@controller.grant.primaryFunder.name}}
        </li>
        <li>
          <strong>
            Start:
          </strong>
          {{formatDate @controller.grant.startDate}}
        </li>
        <li>
          <strong>
            End:
          </strong>
          {{formatDate @controller.grant.endDate}}
        </li>
      </ul>
      <ul class='col-sm-6'>
        <li>
          <strong>
            Status:
          </strong>
          {{@controller.grant.awardStatus}}
        </li>
        <li>
          <strong>
            PI:
          </strong>
          {{@controller.grant.pi.displayName}}
        </li>
        <li>
          <strong>
            Co-PI(s) / Co-I(s):
          </strong>
          <ul>
            {{#each @controller.grant.coPis as |person index|}}
              {{#if index}}
                ,
              {{/if}}
              {{person.displayName}}
            {{/each}}
          </ul>
        </li>
      </ul>
    </div>
  </div>
  <div class='row'>
    <div class='col-12 table-container'>
      <h3 class='font-weight-light'>
        Submissions for grant
      </h3>
      <div class='submission-table'>
        <ModelsTableServerPaginated
          @data={{@controller.queuedModel.submissions.data}}
          @columns={{@controller.columns}}
          @columnComponents={{hash
            submissionsArticleCell=(component SubmissionsArticleCell)
            submissionsAwardCell=(component SubmissionsAwardCell)
            submissionsRepoCell=(component SubmissionsRepoCell)
            submissionsStatusCell=(component SubmissionsStatusCell)
            submissionsRepoidCell=(component SubmissionsRepoidCell)
            submissionActionCell=(component SubmissionActionCell)
            dateCell=(component DateCell)
          }}
          @themeInstance={{@controller.themeInstance}}
          @showColumnsDropdown={{false}}
          @filteringIgnoreCase={{true}}
          @multipleColumnsSorting={{false}}
          @useFilteringByColumns={{false}}
          @showGlobalFilter={{false}}
          @pageSize={{@controller.pageSize}}
          @pageSizeValues={{@controller.tablePageSizeValues}}
          @currentPageNumber={{@controller.page}}
          @itemsCount={{@controller.itemsCount}}
          @pagesCount={{@controller.pagesCount}}
          @filterString={{@controller.filter}}
          @filterQueryParameters={{@controller.filterQueryParameters}}
          @doQuery={{@controller.doQuery}}
          @onDisplayDataChanged={{@controller.displayAction}}
        />
      </div>
    </div>
  </div>
</template> satisfies TemplateOnlyComponent<Signature>
