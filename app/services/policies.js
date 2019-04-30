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
   * @returns {Promise} list of typed policy references
   * [
   *    {
   *      id: 'policy_id',
   *      type: 'funder|institution'
   *    }
   * ]
   */
  getPolicies(submission) {
    const url = `${this.get('policyUrl')}?submission=${submission.get('id')}`;

    return fetch(url, {
      method: 'GET',
      headers: {
        // 'Content-Type': 'application/json'
        credentials: 'include'
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error(`Recieved response ${response.status} : ${response.statusText}`);
      });
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
   * @returns {Promise} JSON object with repo selection DSL rules
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
    const url = `${this.get('repoUrl')}?submission=${submission.get('id')}`;

    return fetch(url, {
      method: 'GET',
      headers: {
        credentials: 'include'
      }
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error(`Recieved response ${response.status} : ${response.statusText}`);
      });
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
      const url = ref.url || ref.id;
      ref[type] = this.get('store').findRecord(type, url).then((obj) => { ref[type] = obj; });
      return ref;
    });
    return refs;
  }

});
