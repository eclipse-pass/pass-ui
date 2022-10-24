import ENV from '../config/environment';

function dataPath() {
  let path = ENV.passApi.PASS_API_NAMESPACE || 'data';
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return path;
}

/**
 * File that can handle backend service calls.
 * We'll still provide faked responses, but will use real IDs
 * from the backend so that the UI workflow doesn't break
 * when trying to use the mocked response data
 *
 * TODO: How do we switch off between real backend and testing
 * mocks?
 */

// const NIH_POLICY_MATCHER = 'National Institutes of Health Public Access Policy';
// const J10P_POLICY_MATCHER = 'Johns Hopkins University (JHU) Open Access Policy';
// const NIH_REPO_MATCHER = 'pmc';
// const J10P_REPO_MATCHER = 'jscholarship';

// /**
//  * @returns pseudo-static data - get J10P and NIH policies
//  *          with correct IDs as found in a real backend
//  */
// export async function passthroughPolicies() {
//   console.log(`[PolicyService] passthrough for /policyservice/policies`);
//   const filter = `filter[policy]=title=ini="${NIH_POLICY_MATCHER}",title=ini="${J10P_POLICY_MATCHER}"`;

//   const response = await fetch(`${dataPath()}/policy?${filter}`);

//   if (!response.ok) {
//     throw new Error(`Error '/policyservice/policies': ${response.statusText}`);
//   }

//   const data = await response.json();

//   return data.data.map((item) => ({
//     id: item.id,
//     type: item.attributes.title === J10P_POLICY_MATCHER ? 'institution' : 'funder',
//   }));
// }

// export async function passthroughRepositories() {
//   console.log(`[PolicyService] passthrough for /policyservice/repositories`);
//   const filter =
//     `filter[repository]=repositoryKey=="${NIH_REPO_MATCHER}",repositoryKey=="${J10P_REPO_MATCHER}"`;
//   const response = await fetch(`${dataPath()}/repository?${filter}`);

//   if (!response.ok) {
//     throw new Error(`Error '/policyservice/repositories' : ${response.statusText}`);
//   }

//   const data = await response.json();

//   const j10p = data.data.find(item => item.attributes.repositoryKey === J10P_REPO_MATCHER);
//   const nih = data.data.find(item => item.attributes.repositoryKey === NIH_REPO_MATCHER);

//   return {
//     required: [{ 'repository-id': nih.id, selected: false }],

//   };
// }

export default class MockDataFinder {
  environment;

  constructor(environment) {
    this.environment = environment;
  }

  async findBy(schema, type, filter) {
    if (this.environment !== 'test') {
      const key = Object.keys(filter)[0];
      const filterStr = `filter[${type}]=${key}=ini="${filter[key]}"`;

      const url = `${dataPath()}/${type}?${filterStr}`;
      console.log(`Data passthrough : ${url}`);

      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error(`Error '${url}' : ${resp.statusText}`);
      }

      return (await resp.json()).data;
    }

    return schema.findBy(type, filter);
  }
}
