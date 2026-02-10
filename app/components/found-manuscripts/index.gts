import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

const eq = (a: unknown, b: unknown) => a === b;
const includes = (needle: unknown, haystack: unknown) => {
  if (!Array.isArray(haystack)) return false;
  return haystack.includes(needle);
};

export default class FoundManuscriptsComponent extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare oaManuscriptService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare workflow: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare appStaticConfig: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked foundManuscripts: any[] = [];
  @tracked manuscriptsWithErrors: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked selectedManuscript: any = null;
  @tracked contactUrl: string | undefined;

  constructor(...args: any[]) {
    super(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).getAppConfig.perform();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).setupManuscripts.perform();
  }

  get foundManuscriptsToDisplay() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allFileNames = this.workflow.getFiles().map((file: any) => file.name);

    return (
      this.foundManuscripts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((manuscript: any) => !allFileNames.includes(manuscript.name))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((manuscript: any) => {
          return !!manuscript.name && !!manuscript.url;
        })
    );
  }

  @task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAppConfig = function* (this: any) {
    this.contactUrl = yield this.appStaticConfig.config?.branding?.pages?.contactUrl;
  };

  @task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupManuscripts = function* (this: any) {
    const doi = this.args.doi;

    if (doi) {
      const foundOAMss = yield this.oaManuscriptService.lookup(doi);

      if (foundOAMss) {
        this.foundManuscripts = [...foundOAMss];
      }
    }
  };

  <template>
    {{! template-lint-disable link-rel-noopener simple-unless }}
    {{#if this.setupManuscripts.isIdle}}
      {{#unless @disabled}}
        {{#if (eq this.foundManuscriptsToDisplay.length 0)}}
          <p class='text-muted'>
            We could not find any existing open access copies for your manuscript/article. Please upload your own copy.
          </p>
        {{else}}
          <div class='border p-4' data-test-foundmss-component>
            <p class='text-muted'>
              We found the following OA copies of your manuscript/article. Please select only a peer-reviewed copy for
              inclusion in this submission.&nbsp;
              {{#if this.contactUrl}}
                If you need help determining the appropriate copy to submit to PASS, please&nbsp;
                <a href='{{this.contactUrl}}' target='_blank' rel='noopener noreferrer'>
                  contact us
                </a>
                .
              {{/if}}
            </p>
            <p class='text-muted mb-0'>
              Click the
              <i class='fa fa-cloud-download-alt' aria-hidden='true'></i>
              icon or a file name to view and download a file first.
            </p>
            <p class='text-muted'>
              After downloading you may use the file upload tool to add a file to your submission.
            </p>
            {{#each this.foundManuscriptsToDisplay as |manuscript index|}}
              <div
                class='d-flex flex-row
                  {{if (eq index 0) "border-top "}}
                  border-bottom m-auto p-2 align-items-center justify-content-between'
              >
                <div class='d-flex flex-row flex-shrink-1 align-items-center pr-4'>
                  <a
                    href='{{manuscript.url}}'
                    target='_blank'
                    class='p-2 {{if (includes manuscript.url this.manuscriptsWithErrors) "text-danger"}}'
                    title='Download this manuscript'
                    data-test-add-file-link
                  >
                    {{#if (includes manuscript.url this.manuscriptsWithErrors)}}
                      <i class='fa fa-exclamation-triangle' aria-hidden='true'></i>
                    {{/if}}
                    <span class='pl-2'>
                      {{manuscript.url}}
                    </span>
                    {{#if manuscript.repositoryLabel}}
                      <span class='font-italic'>
                        -
                        {{manuscript.repositoryLabel}}
                      </span>
                    {{/if}}
                    {{#if (includes manuscript.url this.manuscriptsWithErrors)}}
                      <small class='d-flex flex text-danger'>
                        We weren't able to add the file to your submission, please retry.
                      </small>
                    {{/if}}
                  </a>
                </div>
              </div>
            {{/each}}
          </div>
        {{/if}}
      {{/unless}}
    {{else}}
      <div class='text-center'>
        <div class='lds-dual-ring mt-0'></div>
      </div>
    {{/if}}
  </template>
}
