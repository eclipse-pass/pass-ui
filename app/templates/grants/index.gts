import RouteTemplate from 'ember-route-template';
import { hash } from '@ember/helper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ModelsTableServerPaginated from 'ember-models-table/components/models-table-server-paginated';
import GrantLinkCell from 'pass-ui/components/grant-link-cell';
import PiListCell from 'pass-ui/components/pi-list-cell';
import GrantSubmissionCell from 'pass-ui/components/grant-submission-cell';
import GrantActionCell from 'pass-ui/components/grant-action-cell';
import DateCell from 'pass-ui/components/date-cell';
import MessageDialog from 'pass-ui/components/message-dialog';

// prettier-ignore
export default RouteTemplate(
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
          <ModelsTableServerPaginated
            @data={{@controller.queuedModel.grantMap}}
            @columns={{@controller.columns}}
            @columnComponents={{hash
              grantLinkCell=(component GrantLinkCell)
              piListCell=(component PiListCell)
              grantSubmissionCell=(component GrantSubmissionCell)
              grantActionCell=(component GrantActionCell)
              dateCell=(component DateCell)
            }}
            @themeInstance={{@controller.themeInstance}}
            @showColumnsDropdown={{false}}
            @useFilteringByColumns={{false}}
            @filteringIgnoreCase={{true}}
            @multipleColumnsSorting={{false}}
            @currentPageNumber={{@controller.page}}
            @pageSize={{@controller.pageSize}}
            @pageSizeValues={{@controller.tablePageSizeValues}}
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
