import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SurveyModel } from 'survey-js-ui';

export default class MetadataForm extends Component {
  @action
  setupMetadataForm() {
    const surveySchema = this.args.schema;
    const surveyData = this.args.data;

    console.log('hi');
    console.log(surveySchema);
    console.log(surveyData);

    const survey = new SurveyModel(surveySchema);
    survey.data = surveyData;
    survey.render(document.getElementById('schemaForm'));

    survey.onComplete.add((sender, options) => {
      this.args.next(survey.data);
    });
  }
}
