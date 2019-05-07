import Service from '@ember/service';
import ENV from 'pass-ember/config/environment';

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
   * An error will be thrown if an error response is received from the service.
   * Use `.catch(e)` to act on the error, and not `try/catch`
   *
   * @param {Submission} submission
   * @returns {Promise} list of Policies
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
     * Should be a good response - translate each item in list to a Promise of a Policy
     */
    const data = await result.json();

    return data.map(policyInfo => this.get('store').findRecord('policy', policyInfo.id)
      .then((pol) => {
        pol.set('_type', policyInfo.type);
        return pol;
      }));
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
   *                  will contain Promises to Repository objects
   * {
   *    required: [
   *      Promise: Repository
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
        result['one-of'] = [];
        dsl['one-of'].forEach((choiceGroup) => {
          result['one-of'].push(this._resolveRepos(choiceGroup));
        });
      }

      if (dsl.hasOwnProperty('optional')) {
        result.optional = this._resolveRepos(dsl.optional);
      }

      return result;
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
    return repos.map(repoInfo => this.get('store').findRecord('repository', repoInfo['repository-id'])
      .then((repo) => {
        repo.set('_selected', repoInfo.selected);
        return repo;
      }));
  },

  /**
   * Get an Ember array containing referenced Repository objects. Resolve the reference ID
   * from the Ember Store, then add the model object to the reference when done.
   *
   * @param {array} refs reference objects {
   *    url: '',
   *    selected: true|false
   * }
   * @param {string} type object type (example: 'repository')
   * @returns {array} where Repository ID resolved to an Ember model object
   */
  resolveReferences(type, refs) {
    refs.map((ref) => {
      const url = ref.url || ref.id || ref['repository-id'];
      ref[type] = this.get('store').findRecord(type, url).then((obj) => { ref[type] = obj; });
      return ref;
    });
    return refs;
  }

});
