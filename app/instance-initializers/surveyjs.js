// Setup custom SurveyJS validation functions
import { FunctionFactory } from 'survey-core';

// Generates check digit as per ISO 7064 11,2.
function generateCheckDigit(baseDigits) {
  let total = 0;
  for (let i = 0; i < baseDigits.length; i++) {
    let digit = parseInt(baseDigits.charAt(i), 10);
    total = (total + digit) * 2;
  }
  let remainder = total % 11;
  let result = (12 - remainder) % 11;
  return result === 10 ? 'X' : String(result);
}

// Check that the ORCID is valid.
// The ORCID can be in the format: 0000-0002-1825-0097 or https://orcid.org/0000-0002-1825-0097
function validateOrcid([orcid]) {
  if (!orcid) {
    return false;
  }

  let prefix = 'https://orcid.org/';

  if (orcid.startsWith(prefix)) {
    orcid = orcid.slice(prefix.length);
  }

  if (orcid.match(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]{1}$/)) {
    let baseDigits = orcid.replace(/-/g, '').slice(0, 15);
    let checkDigit = orcid.slice(-1).toUpperCase();
    let calculatedCheckDigit = generateCheckDigit(baseDigits);

    if (checkDigit !== calculatedCheckDigit) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

export function initialize(owner) {
  FunctionFactory.Instance.register('validateOrcid', validateOrcid);
}

export default {
  initialize,
};
