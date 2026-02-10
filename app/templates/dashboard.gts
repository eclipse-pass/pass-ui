import RouteTemplate from 'ember-route-template';
import { LinkTo } from '@ember/routing';

const or = (...args: unknown[]) => args.some(Boolean);

// prettier-ignore
export default RouteTemplate(
  <template>
    <div id='dashboard-container' class='row row-eq-height'>
      <div class='col-md-6 mt-4 mb-4'>
        <div class='card'>
          <div class='card-body'>
            <h2 class='card-title font-weight-light'>
              Manage Publication Submissions
            </h2>
            <p class='card-text'>
              The submissions view allows you to:
            </p>
            <ul>
              <li>
                create submissions to one or more repositories in order to comply with the access policies of your
                funders and institutions
              </li>
              <li>
                review the status of previous submissions
              </li>
            </ul>
            <div class='text-center mt-4'>
              {{#if @controller.currentUser.user.isSubmitter}}
                <LinkTo
                  @route='submissions.new'
                  class='btn btn-primary mt-1 mr-1'
                  data-test-start-new-submission={{true}}
                >
                  Start new submission
                </LinkTo>
              {{/if}}
              <LinkTo @route='submissions' class='btn btn-primary mr-auto mt-1'>
                View submissions
              </LinkTo>
            </div>
          </div>
        </div>
      </div>
      <div class='col-md-6 mb-4 mt-4'>
        <div class='card'>
          <div class='card-body'>
            <h2 class='card-title font-weight-light'>
              Manage Grants Compliance
            </h2>
            <p class='card-text'>
              The grants view allows you to:
            </p>
            <ul>
              <li>
                see an overview of submission status at the grant level
              </li>
              <li>
                create a submission for a specific grant
              </li>
            </ul>
            <div class='text-center mt-5'>
              <LinkTo @route='grants' class='btn btn-primary mt-1'>
                Manage grants' submissions
              </LinkTo>
            </div>
          </div>
        </div>
      </div>
    </div>
    {{#if (or @controller.model.numberAwaitingApproval @controller.model.numberAwaitingEdits)}}
      <div class='row'>
        <div class='col-12'>
          <div class='alert alert-info'>
            You have:
            <br />
            {{#if @controller.model.numberAwaitingApproval}}
              <LinkTo @route='submissions.index' class='btn-link-underlined'>
                {{@controller.model.numberAwaitingApproval}}
                submission(s)
              </LinkTo>
              awaiting your approval.
              <br />
            {{/if}}
            {{#if @controller.model.numberAwaitingEdits}}
              <LinkTo @route='submissions.index'>
                {{@controller.model.numberAwaitingEdits}}
                submission(s)
              </LinkTo>
              with a submitter waiting for you to edit them.
            {{/if}}
          </div>
        </div>
      </div>
    {{/if}}
  </template>,
);
