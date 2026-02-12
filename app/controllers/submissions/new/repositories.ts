/* eslint-disable ember/no-get */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, get, set } from '@ember/object';
import { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import swal from 'sweetalert2/dist/sweetalert2.js';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type RepositoryModel from 'pass-ui/models/repository';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';

interface RepositoryWithFunders {
  repository: RepositoryModel;
  funders: string;
}

interface RepositoriesControllerModel {
  newSubmission: SubmissionModel;
  requiredRepositories: RepositoryWithFunders[];
  optionalRepositories: RepositoryWithFunders[];
  choiceRepositories: RepositoryWithFunders[][];
  repositories: RepositoryModel[];
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
}

export default class SubmissionsNewRepositories extends Controller {
  declare model: RepositoriesControllerModel;

  @service declare workflow: Workflow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  get submission(): SubmissionModel {
    return this.model.newSubmission;
  }
  get repositories(): RepositoryModel[] {
    return this.model.repositories;
  }
  get publication(): PublicationModel {
    return this.model.publication;
  }
  get submissionEvents(): SubmissionEventModel[] {
    return this.model.submissionEvents;
  }

  @controller('submissions.new') declare parent: SubmissionsNew;

  // @ts-expect-error TS2729 - @service creates a prototype getter, available during field init
  @tracked maxStep: number = this.workflow.maxStep;
  @tracked loadingNext: boolean = false;

  get nextTabIsActive(): boolean {
    return get(this, 'workflow').getMaxStep() > 6;
  }

  get needValidation(): boolean {
    return this.nextTabIsActive || this.loadingNext;
  }

  @action
  loadNext() {
    set(this, 'loadingNext', true);
    this.validateAndLoadTab('submissions.new.metadata');
  }

  @action
  loadPrevious() {
    this.loadTab('submissions.new.policies');
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    await this.submission.save();
    this.router.transitionTo(gotoRoute);
    set(this, 'loadingNext', false); // reset for next time
  }

  @action
  async validateAndLoadTab(gotoRoute: string): Promise<void> {
    const needValidation = this.needValidation;
    if (needValidation && get(this, 'submission.repositories.length') == 0) {
      const value = await swal.fire({
        target: ENV.APP.rootElement,
        icon: 'warning',
        title: 'No repositories selected',
        html:
          'If you don\'t plan on submitting to any repositories, you can stop at this time. Click "Exit ' +
          'submission" to return to the dashboard, or "Continue submission" to go back and select a repository',
        showCancelButton: true,
        cancelButtonText: 'Exit Submission',
        confirmButtonText: 'Continue submission',
      });

      if (value.dismiss) {
        this.router.transitionTo('dashboard');
      }
      // do nothing
    } else {
      this.loadTab(gotoRoute);
    }
  }

  @action
  abort() {
    this.parent.abort();
  }

  @action
  updateCovidSubmission() {
    this.parent.updateCovidSubmission();
  }
}
