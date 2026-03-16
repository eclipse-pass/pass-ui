import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import type RepositoryModel from 'pass-ui/models/repository';

interface RepositoryCardSignature {
  Args: {
    repository: RepositoryModel;
    type: string;
    toggleRepository?: (repo: RepositoryModel, selected: boolean, type: string) => void;
    choice?: string;
    funders?: string;
  };
  Blocks: {
    default: [];
  };
}

export default class RepositoryCard extends Component<RepositoryCardSignature> {
  @action
  toggle(event: Event) {
    const selected = (event.target as HTMLInputElement).checked;
    this.args.toggleRepository!(this.args.repository, selected, this.args.type);
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
