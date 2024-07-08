/* eslint-disable ember/classic-decorator-no-classic-methods, ember/no-get */
import Service, { inject as service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import { task, all, hash } from 'ember-concurrency';
import { get } from '@ember/object';
import { run } from '@ember/runloop';

/**
 * Service that can get policies and associated repositories for a submission
 */

export default class PoliciesService extends Service {
  @service store;

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

  getPolicies = task(async (submission) => {
    const url = `${ENV.policyService.policyPath}?submission=${submission.id}`;

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        // 'Content-Type': 'application/json'
        credentials: 'include',
      },
    });

    if (!result.ok) {
      run(() => {
        throw new Error(`Recieved response ${result.status} : ${result.statusText}`);
      });
    }

    /**
     * Should be a good response - translate each item in list of Policies
     * NOTE: Promise.all() will consolidate all of the store.findRecord
     * Promises and will ultimately return an array of Policy objects
     */
    const data = await result.json();

    return await all(
      data.map((policyInfo) =>
        this.store.findRecord('policy', policyInfo.id).then((pol) => {
          pol.set('_type', policyInfo.type);
          return pol;
        }),
      ),
    );
  });

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
  @task(function* (submission) {
    const url = `${ENV.policyService.repositoryPath}?submission=${submission.id}`;

    const response = yield fetch(url, {
      method: 'GET',
      headers: {
        credentials: 'include',
      },
    });

    if (!response.ok) {
      throw new Error(`Recieved response ${response.status} : ${response.statusText}`);
    }

    /**
     * For each DSL field (required, one-of, optional), transform each repository info object
     * to a Promise for a Repository object from the Store
     */
    const dsl = yield response.json();

    let result = {};

    if (dsl.hasOwnProperty('required')) {
      result.required = yield get(this, '_resolveRepos').perform(dsl.required);
    }

    if (dsl.hasOwnProperty('one-of')) {
      const choices = [];
      dsl['one-of'].forEach((choiceGroup) => {
        choices.push(get(this, '_resolveRepos').perform(choiceGroup));
      });
      result['one-of'] = yield all(choices);
    }

    if (dsl.hasOwnProperty('optional')) {
      result.optional = yield get(this, '_resolveRepos').perform(dsl.optional);
    }

    return yield hash(result);
  })
  getRepositories;

  /**
   * Transform a list of repository information objects to Repository model objects
   *
   * @param {array} repoInfo {
   *    url: '',
   *    selected: true|false
   * }
   * @returns {array} list of Promises of Repository objects
   */
  @task(function* (repos) {
    return yield all(
      repos.map((repoInfo) =>
        get(this, 'store')
          .findRecord('repository', repoInfo.url)
          .then((repo) => {
            repo.set('_selected', repoInfo.selected);
            return repo;
          }),
      ),
    );
  })
  _resolveRepos;
}
