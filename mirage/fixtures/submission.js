export default [
  {
    // '@id' : 'https://pass.local/fcrepo/rest/submissions/04/4c/0a/2e/044c0a2e-43fa-4611-889a-36fd7c104161',
    // 'grants' : ['https://pass.local/fcrepo/rest/grants/3c/2d/2b/e9/3c2d2be9-e950-4b74-9699-246ebb31fcc9'],
    // 'submitter' : 'https://pass.local/fcrepo/rest/users/0f/46/19/45/0f461945-d381-460e-9cc1-be4b246faa95',
    // 'effectivePolicies' : [
    //   'https://pass.local/fcrepo/rest/policies/e7/3f/26/70/e73f2670-6ef6-4201-bbcd-04631a93d852',
    //   'https://pass.local/fcrepo/rest/policies/5e/2e/16/92/5e2e1692-c128-4fb4-b1a0-95c0e355defd'
    // ],
    // 'repositories' : [
    //   'https://pass.local/fcrepo/rest/repositories/41/96/0a/92/41960a92-d3f8-4616-86a6-9e9cadc1a269',
    //   'https://pass.local/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2'
    // ],
    // 'publication' : 'https://pass.local/fcrepo/rest/publications/ed/89/f5/06/ed89f506-0083-4733-96c9-9edc64157fe0',
    id: '0',
    grantIds: ['0'],
    submitterId: '0',
    effectivePolicyIds: ['5', '0'],
    repositoryIds: ['1', '3'],
    publicationId: '1',
    submitted: false,
    submissionStatus: 'manuscript-required',
    aggregatedDepositStatus: 'not-started',
    source: 'other',
  },
  {
    // '@id' : 'https://pass.local/fcrepo/rest/submissions/7c/ea/02/44/7cea0244-c4a0-4209-94d7-6cf0665e2e4f',
    // 'grants' : ['https://pass.local/fcrepo/rest/grants/01/8f/53/02/018f5302-9827-451a-86fe-e93b1947e439'],
    // 'submitter' : 'https://pass.local/fcrepo/rest/users/da/66/bb/ed/da66bbed-b01b-4810-ac29-d80039e3277c',
    // 'repositories' : ['https://pass.local/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2'],
    // 'publication' : 'https://pass.local/fcrepo/rest/publications/0c/b4/9e/63/0cb49e63-831b-4071-a5e3-c09c6caa87fb',
    id: '1',
    grantIds: ['6'],
    submitterId: '3',
    repositoryIds: ['3'],
    publicationId: '0',
    submitted: true,
    submissionStatus: 'complete',
    source: 'other',
  },
];
