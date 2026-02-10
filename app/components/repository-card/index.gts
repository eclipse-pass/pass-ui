import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class RepositoryCard extends Component {
  @action
  toggle(event: Event) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args = this.args as any;
    const repo = args.repository;
    const type = args.type;
    const selected = (event.target as HTMLInputElement).checked;

    args.toggleRepository(repo, selected, type);
  }

  <template>
    {{! template-lint-disable require-input-label }}
    <li class='list-group-item d-flex align-items-center my-1 gap-2'>
      {{#if @choice}}
        <input
          aria-label='Optional repositories checkbox'
          type='checkbox'
          name={{@repository.name}}
          checked={{@repository._selected}}
          {{on 'click' this.toggle}}
        />
        <label for='{{@repository.name}}' class='mb-0 ml-2'>
          {{@repository.name}}{{#if @funders}}
            -
            {{@funders}}
          {{/if}}
        </label>
      {{else}}
        {{@repository.name}}{{#if @funders}}
          -
          {{@funders}}
        {{/if}}
      {{/if}}

      {{#if @repository.description}}
        <p>
          {{@repository.description}}
        </p>
      {{/if}}
      {{yield}}
    </li>
  </template>
}
