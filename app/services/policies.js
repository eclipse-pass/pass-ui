import Service from '@ember/service';
import ENV from 'pass-ember/config/environent';

export default Service.extend({
  policyUrl: '',
  repoUrl: '',

  store: Ember.inject.service('store'),

  init() {
    this._super(...arguments);

    // this.set('base', ENV.policyService.url);
    const policyConf = ENV.policyService;
    this.set('policyUrl', `${policyConf.url}${policyConf.policySuffix}`);
    this.set('repoUrl', `${policyConf.url}${policyConf.repoSuffix}`);
  },

  /**
   * Get a list of applicable policies for a given submission.
   *
   * @param {Submission} submission
   * @returns {array} list of typed policy references
   * [
   *    {
   *      id: 'policy_id',
   *      type: 'funder|institution'
   *    }
   * ]
   */
  getPolicies(submission) {

  },

  /**
   *
   * @param {Submission} submission with effectivePolicies set
   * @returns {object} JSON object with policy selection DSL rules
   * {
   *    required: [
   *      {
   *        url: 'repo_id',
   *        selected: true|false
   *      }
   *    ],
   *    'one-of': [],
   *    'optional': []
   * }
   */
  getRepositories(submission) {

  }

});
