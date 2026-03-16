import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
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

  setupForm = modifier((element: HTMLElement, [schema, data]: [unknown, unknown]) => {
    if (!schema) return;

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

    this.survey = new SurveyModel(schema);

    this.survey.css = customCss;
    this.survey.showCompleteButton = false;

    this.survey.mergeData(data);

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
    this.survey.render(element);

    if (typeof this.args.onSurveyReady === 'function') {
      this.args.onSurveyReady(this.survey);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.survey.onComplete.add((_sender: any, _options: any) => {
      this.args.next(this.survey.data);
    });

    // Teardown: clear element before re-init when args change
    return () => {
      element.innerHTML = '';
    };
  });

  <template>
    <div id='metadata-form' class='mb-3' data-test-metadata-form {{this.setupForm @schema @data}}></div>
  </template>
}
