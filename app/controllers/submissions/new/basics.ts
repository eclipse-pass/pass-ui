import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type JournalModel from 'pass-ui/models/journal';
import type GrantModel from 'pass-ui/models/grant';
import type AppStore from 'pass-ui/services/store';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

interface BasicsModel {
  newSubmission: SubmissionModel;
  publication: PublicationModel;
  submissionEvents: SubmissionEventModel[];
  journal: JournalModel;
}

export default class SubmissionsNewBasics extends Controller {
  declare model: BasicsModel;
  declare preLoadedGrant: GrantModel | null;

  @service declare workflow: Workflow;
  @service declare store: AppStore;
  @service declare flashMessages: FlashMessageService;
  @service declare router: RouterService;

  @controller('submissions.new') declare parent: SubmissionsNew;

  // Dirty flag: incrementing invalidates the publication getter so it
  // re-reads from the shared model hash after updatePublication mutates it.
  @tracked _publicationVersion = 0;

  get submission(): SubmissionModel {
    return this.model.newSubmission;
  }

  get publication(): PublicationModel {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._publicationVersion; // tracking tag
    return this.model.publication;
  }

  get submissionEvents(): SubmissionEventModel[] {
    return this.model.submissionEvents;
  }

  get journal(): JournalModel {
    return this.model.journal;
  }

  // these errors start as false since you don't want to immediately have all fields turn red
  @tracked titleError: boolean = false;
  @tracked journalError: boolean = false;
  @tracked submitterEmailError: boolean = false;

  get flaggedFields(): string[] {
    const fields = [];
    if (this.titleError) fields.push('title');
    if (this.journalError) fields.push('journal');
    if (this.submitterEmailError) fields.push('submitterEmail');

    return fields;
  }

  get titleIsInvalid(): boolean {
    return !this.model.publication?.title;
  }

  get journalIsInvalid(): boolean {
    const journal = this.model.publication?.journal;
    return !(journal?.get?.('id') || journal?.get?.('journalName'));
  }

  get submitterIsInvalid(): boolean {
    return !this.submission?.submitter?.id && (!this.submission?.submitterEmail || !this.submission?.submitterName);
  }

  get submitterEmailIsInvalid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const email = this.submission?.submitterEmailDisplay;

    return !this.submission?.submitter?.id && (!email || !emailPattern.test(email));
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    // Make sure title is saved in metadata
    const metadata = this.submission.metadata ? JSON.parse(this.submission.metadata) : {};
    metadata.title = this.publication.title;
    this.submission.metadata = JSON.stringify(metadata);

    await this.store.persistRecord(this.submission);
    this.router.transitionTo(gotoRoute);
  }

  @action
  async validateAndLoadTab(gotoRoute: string): Promise<void> {
    this.titleError = false;
    this.journalError = false;
    this.submitterEmailError = false;

    if (this.titleIsInvalid) {
      this.titleError = true;
      this.flashMessages.warning('The title must not be left blank');
    }

    if (this.titleIsInvalid) return; // end here

    // non proxy submission will always have current user as submitter, so only need to validate this for proxy submission
    if (this.submission.isProxySubmission) {
      // If there's no submitter or submitter info and the submission is a new proxy submission:
      if (this.submitterIsInvalid) {
        this.flashMessages.warning(
          'You have indicated that you are submitting on behalf of someone, please select the user or enter their name and email address.',
        );
        return;
      }
      if (!this.submission.submitter?.id) {
        this.submitterEmailError = this.submitterEmailIsInvalid;
        if (this.submitterEmailIsInvalid) {
          this.submitterEmailError = true;
          this.flashMessages.warning(
            'The email address you entered is invalid. Please verify the value and try again.',
          );
          return;
        }
      }
    }

    // After validation, we can save the publication to the Submission
    const publication = this.publication;
    await this.store.persistRecord(publication);
    this.submission.publication = publication;

    this.loadTab(gotoRoute);
  }

  @action
  updateCovidSubmission(): void {
    this.parent.updateCovidSubmission();
  }

  @action
  validateTitle(): void {
    this.titleError = this.titleIsInvalid;
  }

  @action
  validateJournal(): void {
    this.journalError = this.journalIsInvalid;
  }

  @action
  validateSubmitterEmail(): void {
    this.submitterEmailError = this.submitterEmailIsInvalid;
  }

  @action
  updatePublication(publication: PublicationModel): void {
    this.model.publication = publication;
    this._publicationVersion++;
  }

  @action
  abort(): void {
    this.parent.send('abort');
  }
}
