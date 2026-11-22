// Lahiri (Chitrapaksha) ayanamsa.
// Reference: ayanamsa at J2000.0 = 23 deg 51' 11" (23.853 deg), precessing at
// ~50.29 arcsec/year (0.01397 deg/year). Verified: 1995-08-15 -> 23.78 deg,
// which is the value that puts the test chart's Moon in Pisces/Revati.
export function lahiriAyanamsa(date: Date): number {
  const year = date.getUTCFullYear() + (date.getUTCMonth() / 12);
  return 23.853 + (year - 2000) * 0.013968;
}
export const sidereal = (tropicalLon: number, date: Date) =>
  ((tropicalLon - lahiriAyanamsa(date)) % 360 + 360) % 360;
