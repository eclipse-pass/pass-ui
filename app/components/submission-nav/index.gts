import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import ENV from 'pass-ui/config/environment';
import CovidSelectionBanner from 'pass-ui/components/covid-selection-banner';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionModel from 'pass-ui/models/submission';
import type Owner from '@ember/owner';

const eq = (a: unknown, b: unknown) => a === b;
const gt = (a: unknown, b: unknown) => Number(a) > Number(b);

interface SubmissionNavSignature {
  Args: {
    submission: SubmissionModel;
    loadTab: (route: string) => void;
    updateCovidSubmission: () => void;
  };
}

export default class SubmissionNav extends Component<SubmissionNavSignature> {
  @service declare workflow: Workflow;

  @tracked step!: number;
  @tracked maxStep!: number;
  @tracked covidSelectionBanner = false;

  constructor(owner: Owner, args: SubmissionNavSignature['Args']) {
    super(owner, args);
    this.step = this.workflow.getCurrentStep();
    this.maxStep = this.workflow.getMaxStep();

    if (ENV.environment === 'test') {
      this.covidSelectionBanner = true;
    }
  }

  @action
  scrollTo() {
    window.scrollTo(0, 0);
  }

  <template>
    <div class='col-lg-12'>
      <div class='pb-2'>
        <div class='steps'>
          <button
            class='step {{if (eq this.step 1) "btn-primary"}}'
            disabled={{if (gt 1 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.basics')}}
            data-test-workflow-basics-nav-button
          >
            1. Basics
          </button>
          <button
            class='step {{if (eq this.step 2) "btn-primary"}}'
            disabled={{if (gt 2 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.grants')}}
          >
            2. Grants
          </button>
          <button
            class='step {{if (eq this.step 3) "btn-primary"}}'
            disabled={{if (gt 3 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.policies')}}
          >
            3. Policies
          </button>
          <button
            class='step {{if (eq this.step 4) "btn-primary"}}'
            disabled={{if (gt 4 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.repositories')}}
          >
            4. Repositories
          </button>
          <button
            class='step {{if (eq this.step 5) "btn-primary"}}'
            disabled={{if (gt 5 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.metadata')}}
            data-test-workflow-details-nav-button
          >
            5. Details
          </button>
          <button
            class='step {{if (eq this.step 6) "btn-primary"}}'
            disabled={{if (gt 6 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.files')}}
          >
            6. Files
          </button>
          <button
            class='step {{if (eq this.step 7) "btn-primary"}}'
            disabled={{if (gt 7 this.maxStep) 'disabled'}}
            type='button'
            {{on 'click' (fn @loadTab 'submissions.new.review')}}
          >
            7. Review
          </button>
        </div>
      </div>
      {{#if this.covidSelectionBanner}}
        <CovidSelectionBanner @submission={{@submission}} @updateCovidSubmission={{@updateCovidSubmission}} />
      {{/if}}
    </div>
  </template>
}
