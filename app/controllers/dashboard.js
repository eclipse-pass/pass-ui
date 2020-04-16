import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DashboardController extends Controller {
  @service currentUser;

  @tracked roles = get(this, 'currentUser.user.roles');

  get isSubmitter() {
    return this.roles.includes('submitter');
  }
}
