/* eslint-disable ember/no-get */
import Controller from '@ember/controller';

export default class NotFoundErrorController extends Controller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare model: any;

  get icon(): string | undefined {
    return this.model.config.branding.error?.icon;
  }

  get contactUrl(): string | undefined {
    return this.model.config.branding.pages?.contactUrl;
  }
}
