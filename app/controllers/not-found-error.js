
import Controller from '@ember/controller';
import { get } from '@ember/object';

export default class NotFoundErrorController extends Controller {
  get icon() {
    return `${get(this, 'model.config.error.icon')}`;
  }

  get contactUrl() {
    return `${get(this, 'model.config.pages.contactUrl')}`;
  }
}
