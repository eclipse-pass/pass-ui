import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class DisplayMetadataKeys extends Component {
  @service metadataSchema;

  get displayData() {
    return this.metadataSchema.displayMetadata(this.args.submission);
  }
}
