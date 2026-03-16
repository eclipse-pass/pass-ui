import Component from '@glimmer/component';
import { service } from '@ember/service';
import type Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type AppStaticConfigService from 'pass-ui/services/app-static-config';

interface NoticeBannerSignature {
  Args: {
    contactUrl?: string | null;
  };
}

export default class NoticeBanner extends Component<NoticeBannerSignature> {
  @service declare appStaticConfig: AppStaticConfigService;
  @tracked contactUrl: string | null = null;
  @tracked instructionsUrl: string | null = null;

  constructor(owner: Owner, args: NoticeBannerSignature['Args']) {
    super(owner, args);
    this._setupAppStaticConfig.perform();
  }

  get displayInfoBanner() {
    return true;
  }

  _setupAppStaticConfig = task(async () => {
    const config = await this.appStaticConfig.config;
    if (config) {
      this.contactUrl = config.branding?.pages?.['contactUrl'] ?? null;
      this.instructionsUrl = config.branding?.pages?.['instructionsUrl'] ?? null;
    }
  });

  <template>
    {{#if this.displayInfoBanner}}
      <nav class='info-banner p-1 text-center font-weight-bold'>
        Need help making a submission? Read our submission workflow
        <a class='instructions-url' href={{this.instructionsUrl}} target='_blank' rel='noopener noreferrer'>
          instructions
        </a>
        {{#if this.contactUrl}}
          or
          <a class='contact-us-url' href={{this.contactUrl}} target='_blank' rel='noopener noreferrer'>
            contact us
          </a>
        {{/if}}
        .
      </nav>
    {{/if}}
  </template>
}
