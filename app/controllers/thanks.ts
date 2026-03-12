import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type Owner from '@ember/owner';
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

  constructor(owner: Owner) {
    super(owner);

    this.userGuideUrl = this.staticConfig.config?.branding?.pages?.['instructionsUrl'] ?? null;
  }
}
