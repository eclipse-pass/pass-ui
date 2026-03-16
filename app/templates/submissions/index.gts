import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import PassTable from 'pass-ui/components/pass-table';
import SubmissionsArticleCell from 'pass-ui/components/submissions-article-cell';
import SubmissionsAwardCell from 'pass-ui/components/submissions-award-cell';
import SubmissionsRepoCell from 'pass-ui/components/submissions-repo-cell';
import SubmissionsStatusCell from 'pass-ui/components/submissions-status-cell';
import SubmissionsRepoidCell from 'pass-ui/components/submissions-repoid-cell';
import SubmissionActionCell from 'pass-ui/components/submission-action-cell';
import DateCell from 'pass-ui/components/date-cell';
import MessageDialog from 'pass-ui/components/message-dialog';
import type SubmissionsIndex from 'pass-ui/controllers/submissions/index';

interface Signature {
  Args: {
    controller: SubmissionsIndex;
  };
}

// prettier-ignore
<template>
  <div class='d-flex justify-content-between align-items-center my-3'>
    <h1 class='font-weight-light m-0'>
      Submissions
    </h1>
    {{#if @controller.currentUser.user.isSubmitter}}
      <div>
        <LinkTo @route='submissions.new' @query={{hash grant=null submission=null}} class='btn btn-primary'>
          Create new submission
        </LinkTo>
      </div>
    {{/if}}
  </div>
  <p>
    This list contains all Submissions that you have initiated through PASS. If you have an NIH grant, it may also
    contain pre-loaded information about incomplete, in-progress, or completed Submissions to PubMed Central that cite
    a grant for which you are the PI.
    {{#if @controller.faqUrl}}
      Find out more about these pre-loaded NIH submissions on the
      <a href='{{@controller.faqUrl}}#nih-submissions'>
        FAQ page
      </a>
    {{/if}}
  </p>
  <div class='row'>
    <div class='col-12 table-container'>
      <div class='submission-table' data-test-submissions-index-submissions-table>
        <PassTable
          @data={{@controller.queuedModel.submissions}}
          @page={{@controller.page}}
          @pageSize={{@controller.pageSize}}
          @pageSizeValues={{@controller.tablePageSizeValues}}
          @totalItems={{@controller.itemsCount}}
          @totalPages={{@controller.pagesCount}}
          @filterValue={{@controller.filter}}
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
            {{#if @controller.currentUser.user.isSubmitter}}
              <th class='actions-column'>Actions</th>
            {{/if}}
          </:header>
          <:row as |record|>
            <td class='title-column'><SubmissionsArticleCell @record={{record}} /></td>
            <td class='awardnum-funder-column'><SubmissionsAwardCell @record={{record}} /></td>
            <td class='repositories-column'><SubmissionsRepoCell @record={{record}} /></td>
            <td class='date-column'><DateCell @value={{record.submittedDate}} /></td>
            <td class='status-column'><SubmissionsStatusCell @record={{record}} /></td>
            <td class='msid-column'><SubmissionsRepoidCell @record={{record}} /></td>
            {{#if @controller.currentUser.user.isSubmitter}}
              <td class='actions-column'><SubmissionActionCell @record={{record}} /></td>
            {{/if}}
          </:row>
        </PassTable>
      </div>
    </div>
  </div>
  <MessageDialog
    @show={{@controller.messageShow}}
    @to={{@controller.messageTo}}
    @subject={{@controller.messageSubject}}
    @message={{@controller.messageText}}
  />
</template> satisfies TemplateOnlyComponent<Signature>
