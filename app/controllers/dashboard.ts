import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class DashboardController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  @service declare currentUser: CurrentUserService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @tracked roles: any = get(this, 'currentUser.user.roles');

  get isSubmitter(): boolean {
    return this.roles.includes('submitter');
  }
}
