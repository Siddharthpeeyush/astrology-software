// 100-Year Life Prediction — birth year to birth+100.
// Year-by-year lines are driven by the full Vimshottari Dasha sequence
// (120-year cycle, so 100 years is fully covered) plus Jupiter/Saturn
// transit signs for that year (computed with Astronomy Engine at 15 Jan
// and 15 Jul of each year) and the Personal Year number from numerology.
import { planetByName, type Chart } from './chart';
import { dashaAt, vimshottariDasha } from './dasha';
import { tropicalLongitude } from './astronomy';
import { sidereal } from './ayanamsa';
import { SIGNS } from './constants';
import { personalYear } from './numerology';

export interface YearLine { year: number; age: number; maha: string; antar: string; jupiterSign: string; saturnSign: string; personalYear: number; text: string }
export interface LifeStage { stage: string; years: string; summary: string; basis: string }
export function yearLines(chart: Chart): YearLine[] {
  const birthYear = chart.utc.getUTCFullYear();
  const out: YearLine[] = [];
  for (let age = 0; age <= 100; age++) {
    const year = birthYear + age;
    const mid = new Date(Date.UTC(year, 5, 15, 12, 0, 0));
    const { maha, antar } = dashaAt(chart, mid);
    const jup = SIGNS[Math.floor(sidereal(tropicalLongitude('Jupiter', mid), mid) / 30)];
    const sat = SIGNS[Math.floor(sidereal(tropicalLongitude('Saturn', mid), mid) / 30)];
    const py = personalYear(chart.input.date, year).value;
    out.push({
      year, age, maha: maha.lord, antar: antar.lord, jupiterSign: jup, saturnSign: sat, personalYear: py,
      text: `Age ${age} (${year}): ${maha.lord} Mahadasha, ${antar.lord} Antardasha. Jupiter in ${jup}, Saturn in ${sat}. Personal Year ${py}.`,
    });
  }
  return out;
}
export function lifeStages(chart: Chart): LifeStage[] {
  const dashas = vimshottariDasha(chart);
  const stage = (label: string, fromAge: number, toAge: number): LifeStage => {
    const covering = dashas.filter((d) => d.start.getUTCFullYear() <= chart.utc.getUTCFullYear() + toAge && d.end.getUTCFullYear() >= chart.utc.getUTCFullYear() + fromAge).map((d) => d.lord);
    const uniq = [...new Set(covering)];
    return { stage: label, years: `Age ${fromAge}–${toAge}`, summary: `Dashas in this stage: ${uniq.join(', ') || '—'}.`, basis: `Vimshottari sequence from the birth chart` };
  };
  return [
    stage('Childhood & Education', 0, 18),
    stage('Youth & Career Building', 19, 30),
    stage('Family & Marriage', 25, 40),
    stage('Career Peak & Wealth', 35, 55),
    stage('Maturity & Wisdom', 55, 75),
    stage('Later Life', 75, 100),
  ];
}
export function decadeSummaries(chart: Chart): { decade: string; jupiterSigns: string; saturnSigns: string; dashaChanges: string }[] {
  const birthYear = chart.utc.getUTCFullYear();
  const out: { decade: string; jupiterSigns: string; saturnSigns: string; dashaChanges: string }[] = [];
  const dashas = vimshottariDasha(chart);
  for (let d = 0; d < 10; d++) {
    const y0 = birthYear + d * 10; const y1 = y0 + 9;
    const jupSet = new Set<string>(); const satSet = new Set<string>();
    for (let y = y0; y <= y1; y++) {
      const mid = new Date(Date.UTC(y, 5, 15, 12, 0, 0));
      jupSet.add(SIGNS[Math.floor(sidereal(tropicalLongitude('Jupiter', mid), mid) / 30)]);
      satSet.add(SIGNS[Math.floor(sidereal(tropicalLongitude('Saturn', mid), mid) / 30)]);
    }
    const changes = dashas.filter((p) => p.start.getUTCFullYear() >= y0 && p.start.getUTCFullYear() <= y1).map((p) => `${p.lord} (${p.start.getUTCFullYear()})`);
    out.push({ decade: `${y0}–${y1}`, jupiterSigns: [...jupSet].join(', '), saturnSigns: [...satSet].join(', '), dashaChanges: changes.join('; ') || 'No Mahadasha change' });
  }
  return out;
}
export { planetByName };
