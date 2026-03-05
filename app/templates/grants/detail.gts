import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import formatDate from 'pass-ui/helpers/format-date';
import PassTable from 'pass-ui/components/pass-table';
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
        {{! @glint-expect-error - PassTable yields unknown record, cell components accept specific types }}
        <PassTable
          @data={{@controller.queuedModel.submissions.data}}
          @page={{@controller.page}}
          @pageSize={{@controller.pageSize}}
          @pageSizeValues={{@controller.tablePageSizeValues}}
          @totalItems={{@controller.itemsCount}}
          @totalPages={{@controller.pagesCount}}
          @showFilter={{false}}
          @onChange={{@controller.handleTableChange}}
        >
          <:header>
            <th class='title-column'>Article</th>
            <th class='awardnum-funder-column'>Award Number (Funder)</th>
            <th class='repositories-column'>Repositories</th>
            <th class='date-column'>Submitted Date</th>
            <th class='status-column'>Status</th>
            <th class='msid-column'>Manuscript IDs
              <span id='manuscriptIdTooltip' tooltip-position='bottom' tooltip='IDs are assigned to manuscripts by target repositories.'>
                <i class='fas fa-info-circle d-inline'></i>
              </span>
            </th>
            <th class='actions-column'>Actions</th>
          </:header>
          <:row as |record|>
            <td class='title-column'><SubmissionsArticleCell @record={{record}} /></td>
            <td class='awardnum-funder-column'><SubmissionsAwardCell @record={{record}} /></td>
            <td class='repositories-column'><SubmissionsRepoCell @record={{record}} /></td>
            <td class='date-column'><DateCell @value={{record.submittedDate}} /></td>
            <td class='status-column'><SubmissionsStatusCell @record={{record}} /></td>
            <td class='msid-column'><SubmissionsRepoidCell @record={{record}} /></td>
            <td class='actions-column'><SubmissionActionCell @record={{record}} /></td>
          </:row>
        </PassTable>
      </div>
    </div>
  </div>
</template> satisfies TemplateOnlyComponent<Signature>
