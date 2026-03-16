// Setup custom SurveyJS validation functions
import { FunctionFactory } from 'survey-core';

// Generates check digit as per ISO 7064 11,2.
function generateCheckDigit(baseDigits: string) {
  let total = 0;
  for (let i = 0; i < baseDigits.length; i++) {
    const digit = parseInt(baseDigits.charAt(i), 10);
    total = (total + digit) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  return result === 10 ? 'X' : String(result);
}

// Check that the ORCID is valid.
// The ORCID can be in the format: 0000-0002-1825-0097 or https://orcid.org/0000-0002-1825-0097
function validateOrcid(params: unknown[]) {
  let orcid = params[0] as string;
  if (!orcid) {
    return false;
  }

  const prefix = 'https://orcid.org/';

  if (orcid.startsWith(prefix)) {
    orcid = orcid.slice(prefix.length);
  }

  if (orcid.match(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]{1}$/)) {
    const baseDigits = orcid.replace(/-/g, '').slice(0, 15);
    const checkDigit = orcid.slice(-1).toUpperCase();
    const calculatedCheckDigit = generateCheckDigit(baseDigits);

    if (checkDigit !== calculatedCheckDigit) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

export function initialize(_owner: unknown) {
  FunctionFactory.Instance.register('validateOrcid', validateOrcid);
}

export default {
  initialize,
};
