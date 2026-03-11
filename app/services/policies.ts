import Service, { service } from '@ember/service';
import ENV from 'pass-ui/config/environment';
import { task, all, hash } from 'ember-concurrency';
import { run } from '@ember/runloop';
import { findRecord } from 'pass-ui/builders/pass-api';
import type PolicyModel from 'pass-ui/models/policy';
import type RepositoryModel from 'pass-ui/models/repository';
import type SubmissionModel from 'pass-ui/models/submission';

export interface RepoDslResult {
  required?: RepositoryModel[];
  'one-of'?: RepositoryModel[][];
  optional?: RepositoryModel[];
}

/**
 * Service that can get policies and associated repositories for a submission
 */

export default class PoliciesService extends Service {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @service declare store: any;

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

  getPolicies = task(async (submission: SubmissionModel) => {
    const url = `${ENV.policyService.policyPath}?submission=${submission.id}`;

    const result = await fetch(url, {
      method: 'GET',
      headers: {
        'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]*)/)!['1']!,
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
      data.map((policyInfo: { id: string; type: string }) =>
        this.store
          .request(findRecord('policy', policyInfo.id))
          .then(({ content }: { content: { data: PolicyModel } }) => {
            const pol = content.data;
            pol._type = policyInfo.type;
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
  getRepositories = task(async (submission: SubmissionModel) => {
    const url = `${ENV.policyService.repositoryPath}?submission=${submission.id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]*)/)!['1']!,
      },
    });

    if (!response.ok) {
      throw new Error(`Recieved response ${response.status} : ${response.statusText}`);
    }

    /**
     * For each DSL field (required, one-of, optional), transform each repository info object
     * to a Promise for a Repository object from the Store
     */
    const dsl = await response.json();

    const result: Partial<RepoDslResult> = {};

    if (dsl.hasOwnProperty('required')) {
      result.required = await this._resolveRepos.perform(dsl.required);
    }

    if (dsl.hasOwnProperty('one-of')) {
      const choices: Promise<RepositoryModel[]>[] = [];
      dsl['one-of'].forEach((choiceGroup: Array<{ url: string; selected: boolean }>) => {
        choices.push(this._resolveRepos.perform(choiceGroup));
      });
      result['one-of'] = await all(choices);
    }

    if (dsl.hasOwnProperty('optional')) {
      result.optional = await this._resolveRepos.perform(dsl.optional);
    }

    return await hash(result);
  });

  /**
   * Transform a list of repository information objects to Repository model objects
   *
   * @param {array} repoInfo {
   *    url: '',
   *    selected: true|false
   * }
   * @returns {array} list of Promises of Repository objects
   */
  _resolveRepos = task(async (repos: Array<{ url: string; selected: boolean }>) => {
    return await all(
      repos.map((repoInfo) =>
        this.store
          .request(findRecord('repository', repoInfo.url))
          .then(({ content }: { content: { data: RepositoryModel } }) => {
            const repo = content.data;
            repo._selected = repoInfo.selected;
            return repo;
          }),
      ),
    );
  });
}
