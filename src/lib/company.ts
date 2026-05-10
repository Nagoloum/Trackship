/**
 * Company information shown on invoices, the public site and the dashboard.
 * Edit these values to match your real legal entity.
 */
export const COMPANY = {
  name: "Trackship",
  legalName: "Trackship SAS",
  addressLine1: "10 rue de la Logistique",
  postalCode: "75001",
  city: "Paris",
  country: "France",
  email: "contact@trackship.com",
  phone: "+33 1 23 45 67 89",
  website: "https://trackship.com",
  vatNumber: "FR12345678901",
  registrationNumber: "RCS Paris 123 456 789",
  iban: "FR76 1234 5678 9012 3456 7890 123",
  bic: "BNPAFRPP123",
  /** ISO 4217 — used to format invoice amounts. */
  currency: "EUR",
};

export type CompanyInfo = typeof COMPANY;
