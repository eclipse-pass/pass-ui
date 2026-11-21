const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Markup for a repository's deposit agreement, shown in the SweetAlert step that asks the user to
 * agree to it. Used by both the submission Review step and Submission Details (approval).
 *
 * The agreement is long and scrolls inside a fixed-height box, so keyboard users need to be able to
 * reach it to scroll it: `tabindex="0"` puts it in the tab order (SweetAlert's focus trap includes
 * `[tabindex="0"]` elements), and `role="region"` with a name tells screen reader users what they
 * have landed on.
 */
export function depositAgreementHtml(repoName: string, agreementText: string): string {
  const label = escapeAttribute(`Deposit agreement for ${repoName}`);
  return `<div class="form-control deposit-agreement-content py-4 mt-4" role="region" tabindex="0" aria-label="${label}" data-test-deposit-agreement>${agreementText}</div>`;
}
