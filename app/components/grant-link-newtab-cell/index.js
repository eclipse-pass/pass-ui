/* eslint-disable ember/no-empty-glimmer-component-classes */
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class GrantLinkNewtabCell extends Component {
  // Prevent the click from triggering the row selection in the table
  @action
  stopPropagation(event) {
    event.stopPropagation();
  }
}
