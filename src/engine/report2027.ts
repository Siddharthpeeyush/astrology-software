// Personalized Horoscope 2027 — free, instant, generated from the chart.
import { planetByName, type Chart } from './chart';
import { dashaAt, vimshottariDasha } from './dasha';
import { tropicalLongitude } from './astronomy';
import { sidereal } from './ayanamsa';
import { SIGNS, fmtDeg } from './constants';
import { predictionsFor } from './predictions';

export interface MonthLine { month: string; sunSign: string; moonSign: string; moonHouseFromNatal: number; text: string }
export function report2027(chart: Chart): { sections: { title: string; text: string; basis: string }[]; months: MonthLine[]; yogas: string[]; auspiciousMonths: string[] } {
  const moon = planetByName(chart, 'Moon');
  const sections = predictionsFor(chart, new Date(Date.UTC(2027, 5, 15))).map((c) => ({ title: `2027 — ${c.area}`, text: c.text, basis: c.basis }));
  // Raj Yogas actually tested on the chart.
  const yogas: string[] = [];
  const planets = chart.planets;
  const byHouse = (h: number) => planets.filter((p) => p.house === h).map((p) => p.name);
  if (byHouse(1).length && byHouse(10).length) yogas.push(`Kendra strength: planets in Lagna (${byHouse(1).join(', ') || '—'}) and 10th house (${byHouse(10).join(', ') || '—'})`);
  const jup = planetByName(chart, 'Jupiter');
  if ([1, 4, 7, 10].includes(jup.house)) yogas.push(`Guru in Kendra (house ${jup.house}) — Gaja Kesari / Hamsa-type strength from Jupiter`);
  if (moon.house === 1 || moon.house === 4 || moon.house === 7 || moon.house === 10) yogas.push(`Moon in Kendra (house ${moon.house}) — strong mind and public favour`);
  const dasha2027 = vimshottariDasha(chart).filter((p) => p.start.getUTCFullYear() <= 2027 && p.end.getUTCFullYear() >= 2027);
  if (dasha2027.length) yogas.push(`2027 runs under ${dasha2027.map((d) => d.lord).join(' / ')} Mahadasha`);
  if (!yogas.length) yogas.push('No classical Raj Yoga found in this chart — 2027 strength comes from Dasha and transits instead.');
  const months: MonthLine[] = [];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let m = 0; m < 12; m++) {
    const d = new Date(Date.UTC(2027, m, 15, 12, 0, 0));
    const sunSid = sidereal(tropicalLongitude('Sun', d), d);
    const moonSid = sidereal(tropicalLongitude('Moon', d), d);
    const moonHouse = ((Math.floor(moonSid / 30) - moon.signIdx) % 12 + 12) % 12 + 1;
    const { maha: mm } = dashaAt(chart, d);
    months.push({
      month: monthNames[m], sunSign: SIGNS[Math.floor(sunSid / 30)], moonSign: SIGNS[Math.floor(moonSid / 30)],
      moonHouseFromNatal: moonHouse,
      text: `Sun in ${SIGNS[Math.floor(sunSid / 30)]}; transit Moon in ${SIGNS[Math.floor(moonSid / 30)]} (${moonHouse}th from natal Moon). ${mm.lord} Mahadasha running.`,
    });
  }
  const auspiciousMonths = months.filter((mo) => [3, 6, 10, 11].includes(mo.moonHouseFromNatal)).map((mo) => mo.month);
  return { sections, months, yogas, auspiciousMonths };
}
export { fmtDeg };
export type { Chart };
