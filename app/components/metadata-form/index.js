import Component from '@glimmer/component';
import { action } from '@ember/object';
import { SurveyModel } from 'survey-js-ui';
import { DefaultLightPanelless } from 'survey-core/themes';

export default class MetadataForm extends Component {
  survey = null;

  @action
  setupMetadataForm() {
    const surveySchema = this.args.schema;
    const surveyData = this.args.data;

    const customCss = {
      navigation: {
        complete: 'd-none',
      },
      text: {
        root: 'form-control',
      },
      comment: {
        root: 'form-control',
      },
      dropdown: {
        control: 'form-control',
      },
    };

    this.survey = new SurveyModel(surveySchema);

    this.survey.css = customCss;

    this.survey.mergeData(surveyData);

    this.survey.applyTheme(DefaultLightPanelless);

    this.survey.applyTheme({
      cssVariables: {
        '--sjs-primary-backcolor': 'black',
        '--sjs-primary-forecolor': 'white',
        '--sjs-primary-backcolor-light': '#f0f0f0',
        '--sjs-general-backcolor-dim': 'white',
        '--sjs-font-family': 'var(--font-bodycopy)',
      },
    });
    this.survey.render(document.getElementById('metadata-form'));

    if (typeof this.args.onSurveyReady === 'function') {
      this.args.onSurveyReady(this.survey);
    }

    this.survey.onComplete.add((_sender, _options) => {
      this.args.next(this.survey.data);
    });
  }
}
