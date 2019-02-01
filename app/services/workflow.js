import Service from '@ember/service';
// service to hold workflow form state information that is not part of the model
export default Service.extend({
  currentStep: 0,
  maxStep: 1,
  pmcPublisherDeposit: false,
  doiInfo: [],
  filesTemp: [],
  hasStarted: false,

  resetWorkflow() {
    this.setCurrentStep(0);
    this.setMaxStep(1);
    this.setPmcPublisherDeposit(false);
    this.setFilesTemp([]);
    this.setDoiInfo([]);
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
  // putting doiInfo here temporarily, eventually will be moved to its own service
  getDoiInfo() {
    return this.get('doiInfo');
  },
  setDoiInfo(doiInfo) {
    this.set('doiInfo', doiInfo);
  }
});
