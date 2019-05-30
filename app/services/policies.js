import RSVP from 'rsvp';
import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

/**
 * Service that can get policies and associated repositories for a submission
 */
export default Service.extend({
  policyUrl: '',
  repoUrl: '',

  store: Ember.inject.service('store'),

  init() {
    this._super(...arguments);

    // this.set('base', ENV.policyService.url);
    const policyConf = ENV.policyService;

    let policyUrl;
    if (policyConf.policyEndpoint) {
      policyUrl = policyConf.policyEndpoint;
    } else {
      policyUrl = `${policyConf.url}${policyConf.policySuffix}`;
    }
    this.set('policyUrl', policyUrl);

    let repoUrl;
    if (policyConf.repositoryEndpoint) {
      repoUrl = policyConf.repositoryEndpoint;
    } else {
      repoUrl = `${policyConf.url}${policyConf.repoSuffix}`;
    }
    this.set('repoUrl', repoUrl);
  },

  /**
   * Get a list of applicable policies for a given submission.
   *
   * An error will be thrown if an error response is received from the service.
   * Use `.catch(e)` to act on the error, and not `try/catch`
   *
   * @param {Submission} submission
   * @returns {Promise} list of Policies. Once the promise resolves, result =
   * [
   *    {Policy}, ...
   * ]
   */
  async getPolicies(submission) {
    const url = `${this.get('policyUrl')}?submission=${submission.get('id')}`;

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        // 'Content-Type': 'application/json'
        credentials: 'include'
      }
    });

    if (!result.ok) {
      throw new Error(`Recieved response ${result.status} : ${result.statusText}`);
    }

    /**
     * Should be a good response - translate each item in list of Policies
     * NOTE: Promise.all() will consolidate all of the store.findRecord
     * Promises and will ultimately return an array of Policy objects
     */
    const data = await result.json();

    return Promise.all(data.map(policyInfo => this.get('store').findRecord('policy', policyInfo.id)
      .then((pol) => {
        pol.set('_type', policyInfo.type);
        return pol;
      })));
  },

  /**
   * Get a set of repositories based on effective policies applied to the submission.
   * These policies can be selected according to the repo selection DSL.
   *
   * Selection DSL includes three top level fields: required, one-of, optional
   *
   * An error will be thrown if an error response is received from the service.
   * Use `.catch(e)` to act on the error, and not `try/catch`
   *
   * @param {Submission} submission with effectivePolicies set
   * @returns {Promise} JSON object with repo selection DSL rules. Each section
   *                  will contain Repository objects
   * {
   *    required: [
   *      {Repository}
   *    ],
   *    'one-of': [],
   *    'optional': []
   * }
   */
  async getRepositories(submission) {
    const url = `${this.get('repoUrl')}?submission=${submission.get('id')}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        credentials: 'include'
      }
    });

    if (!response.ok) {
      throw new Error(`Recieved response ${response.status} : ${response.statusText}`);
    }

    /**
     * For each DSL field (required, one-of, optional), transform each repository info object
     * to a Promise for a Repository object from the Store
     */
    return response.json().then((dsl) => {
      let result = {};

      if (dsl.hasOwnProperty('required')) {
        result.required = this._resolveRepos(dsl.required);
      }

      if (dsl.hasOwnProperty('one-of')) {
        const choices = [];
        dsl['one-of'].forEach((choiceGroup) => {
          choices.push(this._resolveRepos(choiceGroup));
        });
        result['one-of'] = Promise.all(choices);
      }

      if (dsl.hasOwnProperty('optional')) {
        result.optional = this._resolveRepos(dsl.optional);
      }

      return RSVP.hash(result);
    });
  },

  /**
   * Transform a list of repository information objects to Repository model objects
   *
   * @param {array} repoInfo {
   *    'repository-id': '',
   *    selected: true|false
   * }
   * @returns {array} list of Promises of Repository objects
   */
  _resolveRepos(repos) {
    return Promise.all(repos.map(repoInfo => this.get('store').findRecord('repository', repoInfo['repository-id'])
      .then((repo) => {
        repo.set('_selected', repoInfo.selected);
        return repo;
      })));
  }

});
