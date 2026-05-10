/**
 * Tracking code utilities. Format: `TS` + 9 digits + ISO 3166-1 alpha-2
 * country code (uppercase). Example: `TS947261583FR`.
 */

const TRACKING_CODE_REGEX = /^TS\d{9}[A-Z]{2}$/;

export function isValidTrackingCode(value: string): boolean {
  return TRACKING_CODE_REGEX.test(value);
}

export function normalizeTrackingCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateTrackingCode(destinationCountry: string): string {
  const country = destinationCountry.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error(
      `Invalid destination country code "${destinationCountry}". Expected ISO 3166-1 alpha-2.`
    );
  }
  let digits = "";
  for (let i = 0; i < 9; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `TS${digits}${country}`;
}
