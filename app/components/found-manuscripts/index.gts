import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type OAManuscriptService from 'pass-ui/services/oa-manuscript-service';
import type { ManuscriptInfo } from 'pass-ui/services/oa-manuscript-service';
import type Workflow from 'pass-ui/services/workflow';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type { WorkflowFile } from 'pass-ui/services/workflow';

const eq = (a: unknown, b: unknown) => a === b;
const includes = (needle: unknown, haystack: unknown) => {
  if (!Array.isArray(haystack)) return false;
  return haystack.includes(needle);
};

interface FoundManuscriptsSignature {
  Args: {
    disabled: boolean;
    doi: string | null;
  };
}

export default class FoundManuscriptsComponent extends Component<FoundManuscriptsSignature> {
  @service declare oaManuscriptService: OAManuscriptService;
  @service declare workflow: Workflow;
  @service declare appStaticConfig: AppStaticConfigService;

  @tracked foundManuscripts: ManuscriptInfo[] = [];
  @tracked manuscriptsWithErrors: string[] = [];
  @tracked selectedManuscript: ManuscriptInfo | null = null;
  @tracked contactUrl: string | undefined;

  constructor(...args: any[]) {
    super(...args);
    // @ts-expect-error TS2729 - class fields are initialized after super()
    this.getAppConfig.perform();
    // @ts-expect-error TS2729 - class fields are initialized after super()
    this.setupManuscripts.perform();
  }

  get foundManuscriptsToDisplay() {
    const allFileNames = this.workflow.getFiles().map((file: WorkflowFile) => file.name);

    return this.foundManuscripts
      .filter((manuscript: ManuscriptInfo) => !allFileNames.includes(manuscript.name))
      .filter((manuscript: ManuscriptInfo) => {
        return !!manuscript.name && !!manuscript.url;
      });
  }

  getAppConfig = task(async () => {
    this.contactUrl = await this.appStaticConfig.config?.branding?.pages?.contactUrl;
  });

  setupManuscripts = task(async () => {
    const doi = this.args.doi;

    if (doi) {
      const foundOAMss = await this.oaManuscriptService.lookup(doi);

      if (foundOAMss) {
        this.foundManuscripts = [...foundOAMss];
      }
    }
  });

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
