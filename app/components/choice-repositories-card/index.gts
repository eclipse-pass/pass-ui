import Component from '@glimmer/component';
import { action } from '@ember/object';
import RepositoryCard from 'pass-ui/components/repository-card';

export default class ChoiceRepositoriesCard extends Component {
  @action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleRepository(repository: any, selected: boolean) {
    const checkboxes = Array.from(
      document.querySelectorAll('.choice-repository-card-list > li > input[type="checkbox"]'),
    ).filter((input) => (input as HTMLInputElement).checked);
    if (!selected && checkboxes.length === 0) {
      // Re-check the just-unchecked checkbox to enforce at least one selected
      const checkbox = document.querySelector(
        `.choice-repository-card-list input[name="${repository.name}"]`,
      ) as HTMLInputElement | null;
      if (checkbox) {
        checkbox.checked = true;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.args as any).toggleRepository(repository, selected, 'choice');
    }
  }

  <template>
    <ul class='list-group choice-repository-card-list'>
      {{#each @choiceGroup as |repoInfo|}}
        <RepositoryCard
          @repository={{repoInfo.repository}}
          @funders={{repoInfo.funders}}
          @choice='true'
          @type='choice'
          @toggleRepository={{this.toggleRepository}}
        />
      {{/each}}
    </ul>
    {{yield}}
  </template>
}
