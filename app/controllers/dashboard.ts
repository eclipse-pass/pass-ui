import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DashboardController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare currentUser: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked roles: any = get(this, 'currentUser.user.roles');

  get isSubmitter(): boolean {
    return this.roles.includes('submitter');
  }
}
