/* eslint-disable ember/classic-decorator-no-classic-methods */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';
import type SubmissionModel from 'pass-ui/models/submission';

interface ThanksModel {
  submission: SubmissionModel;
}

export default class ThanksController extends Controller {
  declare model: ThanksModel;
  queryParams = ['submission'];

  @service('app-static-config') declare staticConfig: AppStaticConfigService;

  @tracked submission: string | null = null;
  @tracked userGuideUrl: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    super(...args);

    this.userGuideUrl = this.staticConfig.config?.branding?.pages?.['instructionsUrl'] ?? null;
  }
}
