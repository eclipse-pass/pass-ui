import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DisplayMetadataKeys extends Component {
  @service metadataSchema;

  @tracked displayData = null;

  @action
  async setupDisplayData() {
    const schemaService = this.metadataSchema;
    const displayData = await schemaService.displayMetadata(this.args.submission);
    this.displayData = displayData;
  }
}
