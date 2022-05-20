export default [
  {
    integrationType: 'web-link',
    '@type': 'Repository',
    formSchema:
      '{"id":"eric","schema":{"title":"Department of Education - ERIC <br><small>Requires deposit to Education Resource Information Center (ERIC).</small><br><br><p class=\'lead text-muted\'>Automatic submission from PASS to ERIC is not available at this time. Instead, submission to ERIC will be prompted before this submission is finalized in PASS. The publication information collected so far can be used to complete the submission via the ERIC website.</p>","type":"object","properties":{}},"options":{"fields":{}}}',
    name: 'Educational Resources Information Center (ERIC)',
    '@id': 'https://pass.local/fcrepo/rest/repositories/9c/10/6a/13/9c106a13-122b-4775-8c04-4f9c926ee451',
    '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    url: 'https://eric.ed.gov/',
    repositoryKey: 'eric',
  },
  {
    agreementText:
      'NON-EXCLUSIVE LICENSE FOR USE OF MATERIALS This non-exclusive license defines the terms for the deposit of Materials in all formats into the digital repository of materials collected, preserved and made available through the Johns Hopkins Digital Repository, JScholarship. The Contributor hereby grants to Johns Hopkins a royalty free, non-exclusive worldwide license to use, re-use, display, distribute, transmit, publish, re-publish or copy the Materials, either digitally or in print, or in any other medium, now or hereafter known, for the purpose of including the Materials hereby licensed in the collection of materials in the Johns Hopkins Digital Repository for educational use worldwide. In some cases, access to content may be restricted according to provisions established in negotiation with the copyright holder. This license shall not authorize the commercial use of the Materials by Johns Hopkins or any other person or organization, but such Materials shall be restricted to non-profit educational use. Persons may apply for commercial use by contacting the copyright holder. Copyright and any other intellectual property right in or to the Materials shall not be transferred by this agreement and shall remain with the Contributor, or the Copyright holder if different from the Contributor. Other than this limited license, the Contributor or Copyright holder retains all rights, title, copyright and other interest in the images licensed. If the submission contains material for which the Contributor does not hold copyright, the Contributor represents that s/he has obtained the permission of the Copyright owner to grant Johns Hopkins the rights required by this license, and that such third-party owned material is clearly identified and acknowledged within the text or content of the submission. If the submission is based upon work that has been sponsored or supported by an agency or organization other than Johns Hopkins, the Contributor represents that s/he has fulfilled any right of review or other obligations required by such contract or agreement. Johns Hopkins will not make any alteration, other than as allowed by this license, to your submission. This agreement embodies the entire agreement of the parties. No modification of this agreement shall be of any effect unless it is made in writing and signed by all of the parties to the agreement.',
    integrationType: 'full',
    '@type': 'Repository',
    formSchema:
      '{"id":"JScholarship","schema":{"title":"Johns Hopkins - JScholarship <br><p class=\'lead text-muted\'>Deposit requirements for JH\'s institutional repository JScholarship.</p>","type":"object","properties":{"authors":{"title":"<div class=\'row\'><div class=\'col-6\'>Author(s) <small class=\'text-muted\'>(required)</small></div><div class=\'col-6 p-0\'></div></div>","type":"array","uniqueItems":true,"items":{"type":"object","properties":{"author":{"type":"string","fieldClass":"body-text col-6 pull-left pl-0"}}}}}},"options":{"fields":{"authors":{"hidden":false}}}}',
    name: 'JScholarship',
    '@id': 'https://pass.local/fcrepo/rest/repositories/41/96/0a/92/41960a92-d3f8-4616-86a6-9e9cadc1a269',
    '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    url: 'https://jscholarship.library.jhu.edu/',
    repositoryKey: 'jscholarship',
  },
  {
    integrationType: 'web-link',
    '@type': 'Repository',
    formSchema:
      '{"id":"dec","schema":{"title":"United States Agency for International Development - DEC <br><small>Requires deposit to the Development Experience Clearingshouse (DEC).</small><br><br><p class=\'lead text-muted\'>Automatic submission from PASS to ERIC is not available at this time. Instead, submission to DEC will be prompted before this submission is finalized in PASS. The publication information collected so far can be used to complete the submission via the DEC website.</p>","type":"object","properties":{}},"options":{"fields":{}}}',
    name: 'Development Experience Clearingshouse (DEC)',
    '@id': 'https://pass.local/fcrepo/rest/repositories/77/cc/80/64/77cc8064-a918-4823-968d-2b17386db76d',
    '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.2.jsonld',
    url: 'https://dec.usaid.gov/',
    repositoryKey: 'dec',
  },
  {
    integrationType: 'one-way',
    '@type': 'Repository',
    formSchema:
      '{"id":"nih","data":{},"schema":{"title":"NIH Manuscript Submission System (NIHMS) <br><p class=\'lead text-muted\'>The following metadata fields will be part of the NIHMS submission.</p>","type":"object","properties":{"journal-NLMTA-ID":{"type":"string"}}},"options":{"fields":{"journal-NLMTA-ID":{"type":"text","label":"Journal NLMTA ID","placeholder":""}}}}',
    schemas: [
      'https://oa-pass.github.io/metadata-schemas/jhu/nihms.json',
      'https://oa-pass.github.io/metadata-schemas/jhu/common.json',
    ],
    name: 'PubMed Central',
    '@id': 'https://pass.local/fcrepo/rest/repositories/77/64/12/ec/776412ec-0f5e-488e-97dc-15bb427d27e2',
    '@context': 'https://oa-pass.github.io/pass-data-model/src/main/resources/context-3.3.jsonld',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/',
    repositoryKey: 'pmc',
  },
];
