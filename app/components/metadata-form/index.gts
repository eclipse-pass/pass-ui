import Component from '@glimmer/component';
import { action } from '@ember/object';
import didInsert from 'pass-ui/modifiers/did-insert';
import didUpdate from 'pass-ui/modifiers/did-update';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { SurveyModel } from 'survey-js-ui';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DefaultLightPanelless } from 'survey-core/themes';

interface MetadataFormSignature {
  Args: {
    schema: unknown;
    data: unknown;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSurveyReady?: (survey: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: (data: any) => void;
  };
}

export default class MetadataForm extends Component<MetadataFormSignature> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  survey: any = null;

  @action
  setupMetadataForm() {
    const surveySchema = this.args.schema;
    const surveyData = this.args.data;

    const customCss = {
      body: 'pt-4',
      page: {
        root: '',
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
    this.survey.showCompleteButton = false;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.survey.onComplete.add((_sender: any, _options: any) => {
      this.args.next(this.survey.data);
    });
  }

  <template>
    <div
      id='metadata-form'
      class='mb-3'
      data-test-metadata-form
      {{didInsert this.setupMetadataForm}}
      {{didUpdate this.setupMetadataForm @schema @data}}
    ></div>
  </template>
}
