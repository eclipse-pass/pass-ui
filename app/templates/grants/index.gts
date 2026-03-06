import type { TemplateOnlyComponent } from '@ember/component/template-only';
import PassTable from 'pass-ui/components/pass-table';
import GrantLinkCell from 'pass-ui/components/grant-link-cell';
import PiListCell from 'pass-ui/components/pi-list-cell';
import GrantSubmissionCell from 'pass-ui/components/grant-submission-cell';
import GrantActionCell from 'pass-ui/components/grant-action-cell';
import DateCell from 'pass-ui/components/date-cell';
import MessageDialog from 'pass-ui/components/message-dialog';
import type GrantsIndexController from 'pass-ui/controllers/grants/index';

interface Signature {
  Args: {
    controller: GrantsIndexController;
  };
}

// prettier-ignore
<template>
  <div class='row'>
    <div class='col-12'>
      <h1 class='font-weight-light'>
        Your Grants
      </h1>
      {{#if @controller.faqUrl}}
        <p>
          For information about which grants are displayed in PASS, please see our
          <a href='{{@controller.faqUrl}}'>
            FAQ page
          </a>
          .
        </p>
      {{/if}}
    </div>
  </div>
  <div class='row justify-content-center grant-table'>
    <div class='col-12 table-container'>
      <div class='grant-table'>
        {{#if @controller.currentUser.user.isAdmin}}
          <PassTable
            @data={{@controller.queuedModel.grantMap}}
            @page={{@controller.page}}
            @pageSize={{@controller.pageSize}}
            @pageSizeValues={{@controller.tablePageSizeValues}}
            @totalItems={{@controller.itemsCount}}
            @totalPages={{@controller.pagesCount}}
            @filterValue={{@controller.filter}}
            @onChange={{@controller.handleTableChange}}
          >
            <:header>
              <th class='projectname-column'>Project Name</th>
              <th class='funder-column'>Funder</th>
              <th class='awardnum-column'>Award Number</th>
              <th>PI</th>
              <th class='date-column'>Start</th>
              <th class='date-column'>End</th>
              <th>Status</th>
              <th>Submissions count</th>
            </:header>
            <:row as |record|>
              <td class='projectname-column'><GrantLinkCell @record={{record}} @value={{record.grant.projectName}} /></td>
              <td class='funder-column'>{{record.grant.primaryFunder.name}}</td>
              <td class='awardnum-column'><GrantLinkCell @record={{record}} @value={{record.grant.awardNumber}} /></td>
              <td><PiListCell @record={{record}} /></td>
              <td class='date-column'><DateCell @value={{record.grant.startDate}} /></td>
              <td class='date-column'><DateCell @value={{record.grant.endDate}} /></td>
              <td>{{record.grant.awardStatus}}</td>
              <td><GrantLinkCell @record={{record}} @value={{record.submissions.length}} /></td>
            </:row>
          </PassTable>
        {{else if @controller.currentUser.user.isSubmitter}}
          <PassTable
            @data={{@controller.queuedModel.grantMap}}
            @page={{@controller.page}}
            @pageSize={{@controller.pageSize}}
            @pageSizeValues={{@controller.tablePageSizeValues}}
            @totalItems={{@controller.itemsCount}}
            @totalPages={{@controller.pagesCount}}
            @filterValue={{@controller.filter}}
            @onChange={{@controller.handleTableChange}}
          >
            <:header>
              <th class='projectname-column'>Project Name</th>
              <th class='funder-column'>Funder</th>
              <th class='awardnum-column'>Award #</th>
              <th class='date-column'>End Date</th>
              <th># of Submissions</th>
              <th>Status</th>
              <th>Actions</th>
            </:header>
            <:row as |record|>
              <td class='projectname-column'><GrantLinkCell @record={{record}} @value={{record.grant.projectName}} /></td>
              <td class='funder-column'>{{record.grant.primaryFunder.name}}</td>
              <td class='awardnum-column'><GrantLinkCell @record={{record}} @value={{record.grant.awardNumber}} /></td>
              <td class='date-column'><DateCell @value={{record.grant.endDate}} /></td>
              <td><GrantSubmissionCell @record={{record}} @value={{record.submissions.length}} /></td>
              <td>{{record.grant.awardStatus}}</td>
              <td><GrantActionCell @record={{record}} /></td>
            </:row>
          </PassTable>
        {{/if}}
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
