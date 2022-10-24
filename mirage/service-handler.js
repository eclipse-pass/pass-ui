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

const NIH_POLICY_MATCHER = 'National Institutes of Health Public Access Policy';
const J10P_POLICY_MATCHER = 'Johns Hopkins University (JHU) Open Access Policy';

/**
 * @returns pseudo-static data - get J10P and NIH policies
 *          with correct IDs as found in a real backend
 */
export async function passthroughPolicies() {
  console.log(`[PolicyService] passthrough for /policyservice/policies`);
  const filter = `filter[policy]=title=ini="${NIH_POLICY_MATCHER}",title=ini="${J10P_POLICY_MATCHER}"`;

  const response = await fetch(`${dataPath()}/policy?${filter}`);

  if (!response.ok) {
    throw new Error(`Policy service passthrough failed: ${response.statusText}`);
  }

  const data = await response.json();

  return data.data.map((item) => ({
    id: item.id,
    type: item.attributes.title === J10P_POLICY_MATCHER ? 'institution' : 'funder',
  }));
}
