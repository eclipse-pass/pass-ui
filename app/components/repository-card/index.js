import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RepositoryCard extends Component {
  @action
  toggle() {
    const repo = this.args.repository;
    const type = this.type;
    const selected = event.target.checked;

    this.args.toggleRepository(repo, selected, type);
  }
}
