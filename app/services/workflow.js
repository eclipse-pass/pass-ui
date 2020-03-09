import { A } from '@ember/array';
import Service from '@ember/service';
// service to hold workflow form state information that is not part of the model
export default Service.extend({
  currentStep: 0,
  maxStep: 1,
  /**
   * Flag that represents whether the Publisher is responsible for PMC submission. If FALSE,
   * then PASS must handle the submission for NIH compliance.
   */
  pmcPublisherDeposit: false,

  doiInfo: {},
  dataFromCrossref: false,

  filesTemp: [],
  defaultRepoLoaded: false, // you only want to load the default setting on first access, after that is should respect he user's choice.

  addedGrants: A([]),

  resetWorkflow() {
    this.setCurrentStep(0);
    this.setMaxStep(1);
    this.setPmcPublisherDeposit(false);
    this.setFilesTemp([]);
    this.setDoiInfo({});
    this.setDefaultRepoLoaded(false);
    this.clearAddedGrants();
  },
  getCurrentStep() {
    return this.get('currentStep');
  },
  setCurrentStep(stepNumber) {
    this.set('currentStep', stepNumber);
    if (this.get('maxStep') < stepNumber) {
      this.setMaxStep(stepNumber);
    }
  },
  getMaxStep() {
    return this.get('maxStep');
  },
  setMaxStep(stepNumber) {
    this.set('maxStep', stepNumber);
    // This ensures default repo is reloaded
    if (stepNumber < 4) this.setDefaultRepoLoaded(false);
  },
  getPmcPublisherDeposit() {
    return this.get('pmcPublisherDeposit');
  },
  setPmcPublisherDeposit(pmcPublisherDeposit) {
    this.set('pmcPublisherDeposit', pmcPublisherDeposit);
  },
  getFilesTemp() {
    return this.get('filesTemp');
  },
  setFilesTemp(filesTemp) {
    this.set('filesTemp', filesTemp);
  },
  getDefaultRepoLoaded() {
    return this.get('defaultRepoLoaded');
  },
  setDefaultRepoLoaded(defaultRepoLoaded) {
    this.set('defaultRepoLoaded', defaultRepoLoaded);
  },
  getDoiInfo() {
    return this.get('doiInfo');
  },
  setDoiInfo(doiInfo, fromCrossref) {
    this.set('doiInfo', doiInfo);
    this.setFromCrossref(!!fromCrossref);
  },
  setFromCrossref(fromCrossref) {
    this.set('dataFromCrossref', fromCrossref);
  },
  isDataFromCrossref() {
    return this.get('dataFromCrossref');
  },
  getAddedGrants() {
    return this.get('addedGrants');
  },
  addGrant(grant) {
    this.get('addedGrants').pushObject(grant);
  },
  removeGrant(grant) {
    this.get('addedGrants').removeObject(grant);
  },
  clearAddedGrants() {
    this.get('addedGrants').clear();
  }
});
