
import Controller from '@ember/controller';
import { get } from '@ember/object';

export default class NotFoundErrorController extends Controller {
  get icon() {
    return `${get(this, 'model.config.assetsUri')}img/error-icon.png`;
  }

  get contactUrl() {
    return `${get(this, 'model.config.assetsUri')}contact.html`;
  }
}
