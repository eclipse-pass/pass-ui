import Controller from '@ember/controller';
import type { StaticConfig } from 'pass-ui/services/app-static-config';

interface NotFoundErrorModel {
  config: StaticConfig | null;
}

export default class NotFoundErrorController extends Controller {
  declare model: NotFoundErrorModel;

  get icon(): string | undefined {
    return (this.model.config?.branding?.['error'] as Record<string, string> | undefined)?.['icon'];
  }

  get contactUrl(): string | undefined {
    return this.model.config?.branding?.pages?.['contactUrl'];
  }
}
