/* eslint-disable ember/no-get */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import { service } from '@ember/service';
import type CurrentUserService from 'pass-ui/services/current-user';

export default class DashboardController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  @service declare currentUser: CurrentUserService;

  @tracked roles: string[] = get(this, 'currentUser.user.roles') as string[];

  get isSubmitter(): boolean {
    return this.roles.includes('submitter');
  }
}
