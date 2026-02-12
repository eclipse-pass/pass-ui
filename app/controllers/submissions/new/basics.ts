/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-get, ember/use-brace-expansion, ember/require-computed-property-dependencies */
import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';

import type Workflow from 'pass-ui/services/workflow';
import type SubmissionsNew from 'pass-ui/controllers/submissions/new';
import type SubmissionModel from 'pass-ui/models/submission';
import type PublicationModel from 'pass-ui/models/publication';
import type SubmissionEventModel from 'pass-ui/models/submission-event';
import type JournalModel from 'pass-ui/models/journal';
import type GrantModel from 'pass-ui/models/grant';

export default class SubmissionsNewBasics extends Controller {
  declare preLoadedGrant: GrantModel | null;

  @service declare workflow: Workflow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare flashMessages: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare router: any;

  @alias('model.newSubmission') submission!: SubmissionModel;
  @alias('model.publication') publication!: PublicationModel;
  @alias('model.submissionEvents') submissionEvents!: SubmissionEventModel[];
  @alias('model.journal') journal!: JournalModel;

  @controller('submissions.new') declare parent: SubmissionsNew;

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

  @computed('publication.title')
  get titleIsInvalid(): boolean {
    return !get(this, 'publication.title');
  }

  @computed('publication.journal.id', 'publication.journal.journalName')
  get journalIsInvalid(): boolean {
    return !(get(this, 'publication.journal.id') || get(this, 'publication.journal.journalName'));
  }

  @computed('submission.submitter.id', 'submission.submitterEmail', 'submission.submitterName')
  get submitterIsInvalid(): boolean {
    return (
      !get(this, 'submission.submitter.id') &&
      (!get(this, 'submission.submitterEmail') || !get(this, 'submission.submitterName'))
    );
  }

  @computed('submission.submitterEmailDisplay')
  get submitterEmailIsInvalid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const email = get(this, 'submission.submitterEmailDisplay') as string | undefined;

    return !get(this, 'submission.submitter.id') && (!email || !emailPattern.test(email));
  }

  @action
  async loadTab(gotoRoute: string): Promise<void> {
    // Make sure title is saved in metadata
    const metadata = this.submission.metadata ? JSON.parse(this.submission.metadata) : {};
    metadata.title = this.publication.title;
    this.submission.metadata = JSON.stringify(metadata);

    await this.submission.save();
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
    if (get(this, 'submission.isProxySubmission')) {
      // If there's no submitter or submitter info and the submission is a new proxy submission:
      if (this.submitterIsInvalid) {
        this.flashMessages.warning(
          'You have indicated that you are submitting on behalf of someone, please select the user or enter their name and email address.',
        );
        return;
      }
      if (!get(this, 'submission.submitter.id')) {
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
    await publication.save();
    set(this, 'submission.publication', publication);

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
    set(this, 'model.publication', publication);
  }

  @action
  abort(): void {
    this.parent.send('abort');
  }
}
