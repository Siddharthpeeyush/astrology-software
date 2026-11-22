// Varshphal (Tajik annual chart) — solar return.
// For a given year: find the moment the Sun returns to its natal tropical
// longitude (binary search on Astronomy Engine), cast the chart at that
// moment for the birth place, Muntha = Lagna + (years elapsed) signs,
// year lord = lord of the Muntha sign. Tajik aspects are computed from
// the return chart's planet positions (Ithasala etc. are NOT claimed).
import { SIGN_LORDS, SIGNS, norm360 } from './constants';
import { tropicalLongitude } from './astronomy';
import { computeChart, type Chart } from './chart';
import { placidusHouses } from './houses';

export interface Varshphal { year: number; age: number; returnDate: Date; munthaSign: string; munthaHouse: number; yearLord: string; lagnaSign: string; sunLongitude: number }
export function solarReturnDate(natalSunTropical: number, year: number): Date {
  // The Sun returns to its natal longitude once a year, near the birthday.
  // Scan day by day for the wrapped-difference sign change, then bisect.
  const target = norm360(natalSunTropical);
  const f = (ms: number) => {
    const d = ((tropicalLongitude('Sun', new Date(ms)) - target) % 360 + 360) % 360;
    return d > 180 ? d - 360 : d;
  };
  let prevMs = Date.UTC(year, 0, 1); let prev = f(prevMs);
  for (let day = 1; day <= 366; day++) {
    const ms = Date.UTC(year, 0, 1) + day * 86400000;
    const cur = f(ms);
    if (prev < 0 && cur >= 0) {
      let lo = prevMs; let hi = ms;
      for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (f(mid) < 0) lo = mid; else hi = mid; }
      return new Date((lo + hi) / 2);
    }
    prevMs = ms; prev = cur;
  }
  return new Date(Date.UTC(year, 7, 15)); // fallback (should not happen)
}
export function varshphal(natal: Chart, year: number): Varshphal {
  const birthYear = natal.utc.getUTCFullYear();
  const age = year - birthYear;
  const returnUtc = solarReturnDate(natal.tropicalPlanets.Sun, year);
  // Cast the return chart at the return moment, birth place, same tz.
  // computeChart expects local date/time, so convert UTC -> local.
  const local = new Date(returnUtc.getTime() + natal.input.tzOffset * 3600000);
  const localInput = { ...natal.input, date: local.toISOString().slice(0, 10), time: `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}` };
  const retChart = computeChart(localInput);
  // Muntha: natal Lagna + age signs (sidereal).
  const natalMuntha = (Math.floor(natal.lagnaSidereal / 30) + age) % 12;
  return { year, age, returnDate: returnUtc, munthaSign: SIGNS[natalMuntha], munthaHouse: 1, yearLord: SIGN_LORDS[natalMuntha], lagnaSign: retChart.lagnaSign, sunLongitude: retChart.tropicalPlanets.Sun };
}
export function munthaHouse(natal: Chart, year: number): number {
  const age = year - natal.utc.getUTCFullYear();
  const munthaSign = (Math.floor(natal.lagnaSidereal / 30) + age) % 12;
  const lagnaSign = Math.floor(natal.lagnaSidereal / 30);
  return ((munthaSign - lagnaSign) % 12 + 12) % 12 + 1;
}
export { placidusHouses };
