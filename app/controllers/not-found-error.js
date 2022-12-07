/* eslint-disable ember/no-get */
import Controller from '@ember/controller';
import { get } from '@ember/object';

export default class NotFoundErrorController extends Controller {
  get icon() {
    return `${get(this, 'model.config.branding.error.icon')}`;
  }

  get contactUrl() {
    return `${get(this, 'model.config.branding.pages.contactUrl')}`;
  }
}
