/**
 * Shared, single-source-of-truth metadata for legal documents
 * (privacy policy, terms & conditions). Update values here and they
 * propagate everywhere — never hardcode this info into a page.
 */
export const LEGAL = {
  CONTACT_EMAIL: 'sunny_softwares@yahoo.com',
  ADDRESS:
    'B/5, Ananya Appartment, Nr. Mangleshwar Mahadev, Ghodasar, Ahmedabad – 380050, Gujarat, India',
  // The date both documents were last revised and the date they take effect.
  // Keep these in sync when you publish a material update.
  LAST_UPDATED: 'June 6, 2026',
  EFFECTIVE_DATE: 'June 6, 2026',
  COPYRIGHT_YEAR: 2026,
} as const;
