/* eslint-disable ember/no-get */
import Controller from '@ember/controller';

export default class NotFoundErrorController extends Controller {
  get icon() {
    return this.model.config.branding.error?.icon;
  }

  get contactUrl() {
    return this.model.config.branding.pages?.contactUrl;
  }
}
