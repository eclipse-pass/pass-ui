import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';

export default class DisplayMetadataKeys extends Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare metadataSchema: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked displayData: any[] | null = null;

  @action
  async setupDisplayData() {
    const schemaService = this.metadataSchema;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const displayData = await schemaService.displayMetadata((this.args as any).submission);
    this.displayData = displayData;
  }

  <template>
    {{! template-lint-disable no-triple-curlies }}
    <ul class='d-flex flex-column list-unstyled gap-3' {{didInsert this.setupDisplayData}}>
      {{#each this.displayData as |data|}}
        <li>
          {{#if data.isArray}}
            <span class='col-6'>
              <b>{{data.label}}</b>
              <ul>
                {{#each data.value as |moo|}}
                  <li>
                    {{#each-in moo as |key val|}}
                      <span class='col-6'>
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
              {{{data.value}}}
            </span>
          {{/if}}
        </li>
      {{/each}}
    </ul>
    {{yield}}
  </template>
}
