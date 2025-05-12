export default [
  {
    // id: 'https://pass.local/fcrepo/rest/repositories/9c/10/6a/13/9c106a13-122b-4775-8c04-4f9c926ee451',
    id: '0',
    integrationType: 'web-link',
    schemas: ['https://oa-pass.github.io/metadata-schemas/jhu/common.json'],
    name: 'Educational Resources Information Center (ERIC)',
    url: 'https://eric.ed.gov/',
    repositoryKey: 'eric',
  },
  {
    // id: 'https://pass.local/fcrepo/rest/repositories/41/96/0a/92/41960a92-d3f8-4616-86a6-9e9cadc1a269',
    id: '1',
    agreementText:
      'NON-EXCLUSIVE LICENSE FOR USE OF MATERIALS This non-exclusive license defines the terms for the deposit of Materials in all formats into the digital repository of materials collected, preserved and made available through the Johns Hopkins Digital Repository, JScholarship. The Contributor hereby grants to Johns Hopkins a royalty free, non-exclusive worldwide license to use, re-use, display, distribute, transmit, publish, re-publish or copy the Materials, either digitally or in print, or in any other medium, now or hereafter known, for the purpose of including the Materials hereby licensed in the collection of materials in the Johns Hopkins Digital Repository for educational use worldwide. In some cases, access to content may be restricted according to provisions established in negotiation with the copyright holder. This license shall not authorize the commercial use of the Materials by Johns Hopkins or any other person or organization, but such Materials shall be restricted to non-profit educational use. Persons may apply for commercial use by contacting the copyright holder. Copyright and any other intellectual property right in or to the Materials shall not be transferred by this agreement and shall remain with the Contributor, or the Copyright holder if different from the Contributor. Other than this limited license, the Contributor or Copyright holder retains all rights, title, copyright and other interest in the images licensed. If the submission contains material for which the Contributor does not hold copyright, the Contributor represents that s/he has obtained the permission of the Copyright owner to grant Johns Hopkins the rights required by this license, and that such third-party owned material is clearly identified and acknowledged within the text or content of the submission. If the submission is based upon work that has been sponsored or supported by an agency or organization other than Johns Hopkins, the Contributor represents that s/he has fulfilled any right of review or other obligations required by such contract or agreement. Johns Hopkins will not make any alteration, other than as allowed by this license, to your submission. This agreement embodies the entire agreement of the parties. No modification of this agreement shall be of any effect unless it is made in writing and signed by all of the parties to the agreement.',
    integrationType: 'full',
    schemas: [
      'https://oa-pass.github.io/metadata-schemas/jhu/jscholarship.json',
      'https://oa-pass.github.io/metadata-schemas/jhu/common.json',
    ],
    name: 'JScholarship',
    url: 'https://jscholarship.library.jhu.edu/',
    repositoryKey: 'jscholarship',
  },
  {
    // id: 'https://pass.local/fcrepo/rest/repositories/77/cc/80/64/77cc8064-a918-4823-968d-2b17386db76d',
    id: '2',
    integrationType: 'web-link',
    schemas: ['https://oa-pass.github.io/metadata-schemas/jhu/common.json'],
    name: 'Development Experience Clearingshouse (DEC)',
    url: 'https://dec.usaid.gov/',
    repositoryKey: 'dec',
  },
  {
    // id: 'https://pass.local/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2',
    id: '3',
    integrationType: 'one-way',
    schemas: [
      'https://oa-pass.github.io/metadata-schemas/jhu/nihms.json',
      'https://oa-pass.github.io/metadata-schemas/jhu/common.json',
    ],
    name: 'PubMed Central - NATIONAL INSTITUTE OF HEALTH',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/',
    repositoryKey: 'pmc',
  },
];
