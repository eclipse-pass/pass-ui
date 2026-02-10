import RouteTemplate from 'ember-route-template';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ModelsTableServerPaginated from 'ember-models-table/components/models-table-server-paginated';
import SubmissionsArticleCell from 'pass-ui/components/submissions-article-cell';
import SubmissionsAwardCell from 'pass-ui/components/submissions-award-cell';
import SubmissionsRepoCell from 'pass-ui/components/submissions-repo-cell';
import SubmissionsStatusCell from 'pass-ui/components/submissions-status-cell';
import SubmissionsRepoidCell from 'pass-ui/components/submissions-repoid-cell';
import SubmissionActionCell from 'pass-ui/components/submission-action-cell';
import DateCell from 'pass-ui/components/date-cell';
import MessageDialog from 'pass-ui/components/message-dialog';

// prettier-ignore
export default RouteTemplate(
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
          <ModelsTableServerPaginated
            @data={{@controller.queuedModel.submissions}}
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
            @useFilteringByColumns={{false}}
            @filteringIgnoreCase={{true}}
            @multipleColumnsSorting={{false}}
            @authorSelected='authorclick'
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
    <MessageDialog
      @show={{@controller.messageShow}}
      @to={{@controller.messageTo}}
      @subject={{@controller.messageSubject}}
      @message={{@controller.messageText}}
    />
  </template>,
);
