import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Owner from '@ember/owner';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';
import type { MetadataDisplayEntry } from 'pass-ui/services/metadata-schema';
import type SubmissionModel from 'pass-ui/models/submission';

interface DisplayMetadataKeysSignature {
  Args: {
    submission: SubmissionModel;
  };
  Blocks: {
    default: [];
  };
}

export default class DisplayMetadataKeys extends Component<DisplayMetadataKeysSignature> {
  @service declare metadataSchema: MetadataSchemaService;

  @tracked displayData: MetadataDisplayEntry[] | null = null;

  constructor(owner: Owner, args: DisplayMetadataKeysSignature['Args']) {
    super(owner, args);
    this.setupDisplayData();
  }

  async setupDisplayData() {
    const schemaService = this.metadataSchema;
    const displayData = await schemaService.displayMetadata(this.args.submission);
    this.displayData = displayData;
  }

  <template>
    {{! template-lint-disable no-triple-curlies }}
    <ul class='d-flex flex-column list-unstyled gap-3'>
      {{#each this.displayData as |data|}}
        <li>
          {{#if data.isArray}}
            <span class='col-6'>
              <b>{{data.label}}</b>
              <ul>
                {{! @glint-expect-error - data.value is unknown }}
                {{#each data.value as |moo|}}
                  <li>
                    {{#each-in moo as |key val|}}
                      <span class='col-6'>
                        {{! @glint-ignore - key/val are unknown from each-in on unknown value }}
                        <b>{{key}}</b>
                        :
                        {{val}}
                      </span>
                    {{/each-in}}
                  </li>
                {{/each}}
              </ul>
            </span>
          {{else}}
            <span class='col-6'>
              <b>{{data.label}}</b>
              :
              {{! @glint-expect-error - data.value is unknown }}
              {{{data.value}}}
            </span>
          {{/if}}
        </li>
      {{/each}}
    </ul>
    {{yield}}
  </template>
}
