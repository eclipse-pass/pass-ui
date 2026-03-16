import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type GrantModel from 'pass-ui/models/grant';

export interface WorkflowFile {
  id: string;
  name: string;
  [key: string]: unknown;
}

// service to hold workflow form state information that is not part of the model
export default class Workflow extends Service {
  dataFromCrossref = false;

  @tracked currentStep = 0;
  @tracked maxStep = 1;
  /**
   * Flag that represents whether the Publisher is responsible for PMC submission. If FALSE,
   * then PASS must handle the submission for NIH compliance.
   */
  @tracked pmcPublisherDeposit = false;

  @tracked readOnlyProperties: string[] = [];

  @tracked files: WorkflowFile[] = [];
  @tracked defaultRepoLoaded = false; // you only want to load the default setting on first access, after that is should respect he user's choice.

  @tracked addedGrants: GrantModel[] = [];

  resetWorkflow(): void {
    this.setCurrentStep(0);
    this.setMaxStep(1);
    this.setPmcPublisherDeposit(false);
    this.setFiles([]);
    this.setDefaultRepoLoaded(false);
    this.clearAddedGrants();
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  setCurrentStep(stepNumber: number): void {
    this.currentStep = stepNumber;
    if (this.maxStep < stepNumber) {
      this.setMaxStep(stepNumber);
    }
  }

  getMaxStep(): number {
    return this.maxStep;
  }

  setMaxStep(stepNumber: number): void {
    this.maxStep = stepNumber;
    // This ensures default repo is reloaded
    if (stepNumber < 4) this.setDefaultRepoLoaded(false);
  }

  getPmcPublisherDeposit(): boolean {
    return this.pmcPublisherDeposit;
  }

  setPmcPublisherDeposit(pmcPublisherDeposit: boolean): void {
    this.pmcPublisherDeposit = pmcPublisherDeposit;
  }

  getFiles(): WorkflowFile[] {
    return this.files;
  }

  setFiles(files: WorkflowFile[]): void {
    this.files = files;
  }

  addFile(file: WorkflowFile): void {
    const newFiles = [...this.files, file];
    this.setFiles(newFiles);
  }

  removeFile(fileId: string): void {
    const newFiles = this.files.filter((file) => file.id !== fileId);
    this.setFiles(newFiles);
  }

  getDefaultRepoLoaded(): boolean {
    return this.defaultRepoLoaded;
  }

  setDefaultRepoLoaded(defaultRepoLoaded: boolean): void {
    this.defaultRepoLoaded = defaultRepoLoaded;
  }

  getReadOnlyProperties(): string[] {
    return this.readOnlyProperties;
  }

  setReadOnlyProperties(readOnlyProperties: string[]): void {
    this.readOnlyProperties = readOnlyProperties;
  }

  setFromCrossref(fromCrossref: boolean): void {
    this.dataFromCrossref = fromCrossref;
  }

  isDataFromCrossref(): boolean {
    return this.dataFromCrossref;
  }

  getAddedGrants(): GrantModel[] {
    return this.addedGrants;
  }

  addGrant(grant: GrantModel): void {
    this.addedGrants = [grant, ...this.addedGrants];
  }

  removeGrant(grant: GrantModel): void {
    this.addedGrants = this.addedGrants.filter((g) => g.id !== grant.id);
  }

  clearAddedGrants(): void {
    this.addedGrants = [];
  }
}
