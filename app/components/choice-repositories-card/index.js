import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ChoiceRepositoriesCard extends Component {
  /**
   * Bubble the event, except in the case of unchecking the last (checked) checkbox.
   *
   * Investigate all checkboxes that are checked. If no checkboxes are currently checked,
   * then don't act on this input and force the last clicked checkbox to be checked.
   * In this component, there must always be one or more items checked.
   *
   * This occurs when the input event deselects a checkbox and there are no currently
   * checked checkboxes
   *
   * @param {Repository} repository the repository that the user clicked
   * @param {boolean} selected was the repo selected (TRUE) or deselected (FALSE)
   */
  @action
  toggleRepository(repository, selected) {
    const checkboxes = Array.from(document.querySelectorAll('.choice-repository-card-list > li > input[type="checkbox"]'))
      .filter(input => input.checked);
    if (!selected && checkboxes.length === 0) {
      event.target.checked = true;
    } else {
      this.args.toggleRepository(repository, selected, 'choice');
    }
  }
}
