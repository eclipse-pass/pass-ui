/* eslint-disable ember/classic-decorator-no-classic-methods */
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

  @tracked readOnlyProperties = [];

  @tracked filesTemp = [];
  @tracked defaultRepoLoaded = false; // you only want to load the default setting on first access, after that is should respect he user's choice.

  @tracked addedGrants = [];

  resetWorkflow() {
    this.setCurrentStep(0);
    this.setMaxStep(1);
    this.setPmcPublisherDeposit(false);
    this.setFilesTemp([]);
    this.setDefaultRepoLoaded(false);
    this.clearAddedGrants();
  }

  getCurrentStep() {
    return this.currentStep;
  }

  setCurrentStep(stepNumber) {
    this.set('currentStep', stepNumber);
    if (this.maxStep < stepNumber) {
      this.setMaxStep(stepNumber);
    }
  }

  getMaxStep() {
    return this.maxStep;
  }

  setMaxStep(stepNumber) {
    this.set('maxStep', stepNumber);
    // This ensures default repo is reloaded
    if (stepNumber < 4) this.setDefaultRepoLoaded(false);
  }

  getPmcPublisherDeposit() {
    return this.pmcPublisherDeposit;
  }

  setPmcPublisherDeposit(pmcPublisherDeposit) {
    this.pmcPublisherDeposit = pmcPublisherDeposit;
  }

  getFilesTemp() {
    return this.filesTemp;
  }

  setFilesTemp(filesTemp) {
    this.set('filesTemp', filesTemp);
  }

  getDefaultRepoLoaded() {
    return this.defaultRepoLoaded;
  }

  setDefaultRepoLoaded(defaultRepoLoaded) {
    this.set('defaultRepoLoaded', defaultRepoLoaded);
  }

  getReadOnlyProperties() {
    return this.readOnlyProperties;
  }

  setReadOnlyProperties(readOnlyProperties) {
    this.set('readOnlyProperties', readOnlyProperties);
  }

  setFromCrossref(fromCrossref) {
    this.set('dataFromCrossref', fromCrossref);
  }

  isDataFromCrossref() {
    return this.dataFromCrossref;
  }

  getAddedGrants() {
    return this.addedGrants;
  }

  addGrant(grant) {
    this.addedGrants = [grant, ...this.addedGrants];
  }

  removeGrant(grant) {
    this.addedGrants = this.addedGrants.filter((g) => g.id !== grant.id);
  }

  clearAddedGrants() {
    this.addedGrants = [];
  }
}
