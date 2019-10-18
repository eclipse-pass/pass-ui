export default function (server) {
  /**
   * Mock the response from fcrepo for getting a policy
   */
  server.get('https://pass.local/fcrepo/rest/policies/**/', (schema, request) => {
    let policies = schema.policies.all();
    let policy = policies.models.find(policy => policy.attrs._source['@id'] === request.url);

    return policy.attrs._source;
  });

  /**
   * Mock the response from the policy service for getting policies
   */
  server.get('https://pass.local/policyservice/policies', () => [
    {
      id: 'https://pass.local/fcrepo/rest/policies/e7/3f/26/70/e73f2670-6ef6-4201-bbcd-04631a93d852',
      type: 'funder'
    },
    {
      id: 'https://pass.local/fcrepo/rest/policies/5e/2e/16/92/5e2e1692-c128-4fb4-b1a0-95c0e355defd',
      type: 'institution'
    }
  ]);

  /**
   * Mock the response from the policy service for getting repositories
   */
  server.get('https://pass.local/policyservice/repositories', () => ({
    required: [
      {
        'repository-id': 'https://pass.local/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2',
        selected: false
      }
    ],
    'one-of': [],
    optional: [
      {
        'repository-id': 'https://pass.local/fcrepo/rest/repositories/41/96/0a/92/41960a92-d3f8-4616-86a6-9e9cadc1a269',
        selected: true
      }
    ]
  }));
}
