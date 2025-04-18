import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SurveyModel } from 'survey-js-ui';
import { DefaultLightPanelless } from 'survey-core/themes';

export default class MetadataForm extends Component {
  @action
  setupMetadataForm() {
    const surveySchema = this.args.schema;
    const surveyData = this.args.data;

    const survey = new SurveyModel(surveySchema);

    // Use mergeData to preserve default values
    survey.mergeData(surveyData);

    survey.applyTheme(DefaultLightPanelless);
    survey.render(document.getElementById('metadata-form'));

    survey.onComplete.add((sender, options) => {
      this.args.next(survey.data);
    });
  }
}
