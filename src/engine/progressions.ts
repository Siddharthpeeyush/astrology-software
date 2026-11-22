// Western: Secondary Progressions (day-for-a-year), Solar Return,
// Synastry (two Western charts).
import { computeChart, type Chart } from './chart';
import { tropicalLongitude } from './astronomy';
import { westernAspects } from './western';
import { solarReturnDate } from './varshphal';
import { norm360, SIGNS } from './constants';
import type { BirthInput } from './constants';

export function progressedChart(natal: Chart, ageYears: number): { date: Date; sunSign: string; moonSign: string; sunLon: number; moonLon: number } {
  // Secondary progressions: 1 day after birth = 1 year of life.
  const progDate = new Date(natal.utc.getTime() + ageYears * 86400000);
  const sun = tropicalLongitude('Sun', progDate);
  const moon = tropicalLongitude('Moon', progDate);
  return { date: progDate, sunSign: SIGNS[Math.floor(sun / 30)], moonSign: SIGNS[Math.floor(moon / 30)], sunLon: sun, moonLon: moon };
}
export function solarReturnChart(natal: Chart, year: number): { returnDate: Date; chart: Chart } {
  const returnUtc = solarReturnDate(natal.tropicalPlanets.Sun, year);
  const local = new Date(returnUtc.getTime() + natal.input.tzOffset * 3600000);
  const input: BirthInput = { ...natal.input, date: local.toISOString().slice(0, 10), time: `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}` };
  return { returnDate: returnUtc, chart: computeChart(input) };
}
export interface SynastryResult { score: number; max: number; verdict: string; aspects: { p1: string; p2: string; type: string; orb: number }[]; sunMoon: string }
export function synastry(a: Chart, b: Chart): SynastryResult {
  const aspects: { p1: string; p2: string; type: string; orb: number }[] = [];
  const defs = [{ type: 'Conjunction', angle: 0, orb: 8, pts: 5 }, { type: 'Trine', angle: 120, orb: 8, pts: 4 }, { type: 'Sextile', angle: 60, orb: 6, pts: 3 }, { type: 'Square', angle: 90, orb: 7, pts: -2 }, { type: 'Opposition', angle: 180, orb: 8, pts: -1 }];
  let score = 50;
  const pa = a.planets.filter((p) => !['Rahu', 'Ketu'].includes(p.name));
  const pb = b.planets.filter((p) => !['Rahu', 'Ketu'].includes(p.name));
  for (const x of pa) for (const y of pb) {
    const diff = Math.abs(norm360(x.tropical - y.tropical));
    const d = Math.min(diff, 360 - diff);
    for (const def of defs) {
      const orb = Math.abs(d - def.angle);
      if (orb <= def.orb) { aspects.push({ p1: `${x.name} (A)`, p2: `${y.name} (B)`, type: def.type, orb: Math.round(orb * 10) / 10 }); score += def.pts; }
    }
  }
  score = Math.max(0, Math.min(100, score));
  const sunA = a.planets.find((p) => p.name === 'Sun')!; const moonB = b.planets.find((p) => p.name === 'Moon')!;
  const sunMoon = `Sun (A) in ${SIGNS[Math.floor(sunA.tropical / 30)]}, Moon (B) in ${SIGNS[Math.floor(moonB.tropical / 30)]}`;
  return { score, max: 100, verdict: score >= 70 ? 'Strong synastry — many harmonious links' : score >= 50 ? 'Balanced — harmony and friction in measure' : 'Challenging — needs conscious effort', aspects: aspects.slice(0, 20), sunMoon };
}
export { westernAspects };
