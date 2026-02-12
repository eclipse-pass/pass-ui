import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type CurrentUserService from 'pass-ui/services/current-user';

interface DashboardModel {
  numberAwaitingApproval: number;
  numberAwaitingEdits: number;
}

export default class DashboardController extends Controller {
  declare model: DashboardModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  @service declare currentUser: CurrentUserService;

  // @ts-expect-error TS2729 - @service creates a prototype getter, available during field init
  @tracked roles: string[] = this.currentUser.user?.roles ?? [];

  get isSubmitter(): boolean {
    return this.roles.includes('submitter');
  }
}
