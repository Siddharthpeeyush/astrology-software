// Ashtakvarga — Bhinnashtakvarga (BAV) + Sarvashtakvarga (SAV).
// Classical 56 contribution rules (GrahAI / Parashara tradition, verified
// against the published tables: totals Sun 48, Moon 49, Mars 39, Mercury 54,
// Jupiter 56, Venus 52, Saturn 39; grand total always 337).
// Rule: contributor at sign C gives 1 bindu to target planet P in a sign
// that is N signs forward from C, where N is in the table for (P, contributor).
import { SIGNS } from './constants';
import type { Chart } from './chart';

type Contributor = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Lagna';
// RULES[target][contributor] = positions (1-based, counted from contributor's sign)
const RULES: Record<string, Partial<Record<Contributor, number[]>>> = {
  Sun: { Sun: [1,2,4,7,8,9,10,11], Moon: [3,6,10,11], Mars: [1,2,4,7,8,9,10,11], Mercury: [3,5,6,9,10,11,12], Jupiter: [5,6,9,11], Venus: [6,7,12], Saturn: [1,2,4,7,8,9,10,11], Lagna: [3,4,6,10,11,12] },
  Moon: { Sun: [3,6,7,8,10,11], Moon: [1,3,6,7,10,11], Mars: [2,3,5,6,9,10,11], Mercury: [1,3,4,5,7,8,10,11], Jupiter: [1,4,7,8,10,11,12], Venus: [3,4,5,7,9,10,11], Saturn: [3,5,6,11], Lagna: [3,6,10,11] },
  Mars: { Sun: [3,5,6,10,11], Moon: [3,6,11], Mars: [1,2,4,7,8,10,11], Mercury: [3,5,6,11], Jupiter: [6,10,11,12], Venus: [6,8,11,12], Saturn: [1,4,7,8,9,10,11], Lagna: [1,3,6,10,11] },
  Mercury: { Sun: [5,6,9,11,12], Moon: [2,4,6,8,10,11], Mars: [1,2,4,7,8,9,10,11], Mercury: [1,3,5,6,9,10,11,12], Jupiter: [6,8,11,12], Venus: [1,2,3,4,5,8,9,11], Saturn: [1,2,4,7,8,9,10,11], Lagna: [1,2,4,6,8,10,11] },
  Jupiter: { Sun: [1,2,3,4,7,8,9,10,11], Moon: [2,5,7,9,11], Mars: [1,2,4,7,8,10,11], Mercury: [1,2,4,5,6,9,10,11], Jupiter: [1,2,3,4,7,8,10,11], Venus: [2,5,6,9,10,11], Saturn: [3,5,6,12], Lagna: [1,2,4,5,6,7,9,10,11] },
  Venus: { Sun: [8,11,12], Moon: [1,2,3,4,5,8,9,11,12], Mars: [3,4,6,9,11,12], Mercury: [3,5,6,9,11], Jupiter: [5,8,9,10,11], Venus: [1,2,3,4,5,8,9,10,11], Saturn: [3,4,5,8,9,10,11], Lagna: [1,2,3,4,5,8,9,11] },
  Saturn: { Sun: [1,2,4,7,8,10,11], Moon: [3,6,11], Mars: [3,5,6,10,11,12], Mercury: [6,8,9,10,11,12], Jupiter: [5,6,11,12], Venus: [6,11,12], Saturn: [3,5,6,11], Lagna: [1,3,4,6,10,11] },
};
export const BAV_TOTALS: Record<string, number> = { Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39 };
export interface AshtakvargaResult {
  bav: Record<string, number[]>; // target planet -> bindus per sign (Aries..Pisces)
  sav: number[]; // per sign, total 337
  strongestSign: string; weakestSign: string;
}
export function ashtakvarga(chart: Chart): AshtakvargaResult {
  const signOfRef: Record<Contributor, number> = { Sun: 0, Moon: 0, Mars: 0, Mercury: 0, Jupiter: 0, Venus: 0, Saturn: 0, Lagna: 0 };
  for (const p of chart.planets) {
    if (p.name in signOfRef && p.name !== 'Rahu' && p.name !== 'Ketu') signOfRef[p.name as Contributor] = p.signIdx;
  }
  signOfRef.Lagna = Math.floor(chart.lagnaSidereal / 30);
  const bav: Record<string, number[]> = {};
  const sav = new Array<number>(12).fill(0);
  for (const target of Object.keys(RULES)) {
    const row = new Array<number>(12).fill(0);
    for (const [contrib, positions] of Object.entries(RULES[target])) {
      const cSign = signOfRef[contrib as Contributor];
      for (const pos of positions) {
        const sign = (cSign + pos - 1) % 12;
        row[sign] += 1;
      }
    }
    bav[target] = row;
    row.forEach((v, i) => { sav[i] += v; });
  }
  const maxIdx = sav.indexOf(Math.max(...sav));
  const minIdx = sav.indexOf(Math.min(...sav));
  return { bav, sav, strongestSign: SIGNS[maxIdx], weakestSign: SIGNS[minIdx] };
}
