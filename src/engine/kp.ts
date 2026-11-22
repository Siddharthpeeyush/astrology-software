// KP (Krishnamurti Paddhati) cusps and sub-lords.
// KP sub-lord: each sign is divided into 9 sub-divisions in Vimshottari
// proportions (Ketu 7/120, Venus 20/120, Sun 6/120, Moon 10/120, Mars 7/120,
// Rahu 18/120, Jupiter 16/120, Saturn 19/120, Mercury 17/120), starting
// with the sign lord's sub. The sub-lord of a longitude is deterministic.
import { DASHA_ORDER, DASHA_YEARS, SIGNS, norm360 } from './constants';
import type { Chart } from './chart';

export function kpSubLord(lon: number): { signLord: string; starLord: string; subLord: string; subSubLord: string } {
  const signIdx = Math.floor(norm360(lon) / 30);
  const signLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const signLord = signLords[signIdx];
  // Star (nakshatra) lord from the nakshatra within the sign.
  const nakIdx = Math.floor(norm360(lon) / (360 / 27));
  const starLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const starLord = starLords[nakIdx % 9];
  // Sub division: within the star, divide by Vimshottari proportions.
  const starSpan = 360 / 27;
  const withinStar = norm360(lon) - nakIdx * starSpan;
  // Sub-divisions run in Vimshottari order starting from the star lord.
  let acc = 0; let subLord = starLord;
  const starIdx = DASHA_ORDER.indexOf(starLord);
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(starIdx + i) % 9];
    const span = (DASHA_YEARS[lord] / 120) * starSpan;
    if (withinStar < acc + span) { subLord = lord; break; }
    acc += span;
  }
  // Sub-sub: within the sub, divide again starting from the sub lord.
  const subSpan = (DASHA_YEARS[subLord] / 120) * starSpan;
  const withinSub = withinStar - acc;
  let acc2 = 0; let subSubLord = subLord;
  const startIdx = DASHA_ORDER.indexOf(subLord);
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const span = (DASHA_YEARS[lord] / 120) * subSpan;
    if (withinSub < acc2 + span) { subSubLord = lord; break; }
    acc2 += span;
  }
  return { signLord, starLord, subLord, subSubLord };
}
export function kpCusps(chart: Chart) {
  return chart.cuspsSidereal.map((cusp, i) => {
    const kp = kpSubLord(cusp);
    return { house: i + 1, longitude: cusp, sign: SIGNS[Math.floor(cusp / 30)], ...kp };
  });
}
export function kpPlanets(chart: Chart) {
  return chart.planets.map((p) => ({ name: p.name, longitude: p.sidereal, sign: p.sign, ...kpSubLord(p.sidereal) }));
}
