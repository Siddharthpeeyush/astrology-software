// Vimshottari Dasha (120-year cycle) + Yogini Dasha (36-year cycle).
// Balance at birth comes from the Moon's nakshatra: the lord's remaining
// fraction is (1 - Moon's progress through its nakshatra).
import { DASHA_ORDER, DASHA_YEARS, YOGINI_ORDER, YOGINI_YEARS, norm360 } from './constants';
import { planetByName, type Chart } from './chart';

export interface DashaPeriod { lord: string; start: Date; end: Date; years: number }
export function vimshottariDasha(chart: Chart): DashaPeriod[] {
  const moon = planetByName(chart, 'Moon');
  const startLord = moon.nakshatraLord;
  const startIdx = DASHA_ORDER.indexOf(startLord);
  const progress = (norm360(moon.sidereal) % (360 / 27)) / (360 / 27);
  const balanceYears = DASHA_YEARS[startLord] * (1 - progress);
  const birth = chart.utc.getTime();
  const periods: DashaPeriod[] = [];
  let t = birth;
  // First (balance) period, then full cycles until 120 years from birth.
  const seq: { lord: string; years: number }[] = [{ lord: startLord, years: balanceYears }];
  for (let i = 1; i < 40; i++) seq.push({ lord: DASHA_ORDER[(startIdx + i) % 9], years: DASHA_YEARS[DASHA_ORDER[(startIdx + i) % 9]] });
  // The cycle is exactly 120 years from birth: the last period is
  // truncated so the sequence never overshoots 120.
  let elapsed = 0;
  for (const s of seq) {
    const years = Math.min(s.years, 120 - elapsed);
    if (years <= 0) break;
    const start = new Date(t);
    t += years * 365.25 * 86400000;
    periods.push({ lord: s.lord, start, end: new Date(t), years });
    elapsed += years;
  }
  return periods;
}
export function antardashas(_chart: Chart, maha: DashaPeriod): DashaPeriod[] {
  const startIdx = DASHA_ORDER.indexOf(maha.lord);
  const total = maha.years;
  const out: DashaPeriod[] = [];
  let t = maha.start.getTime();
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = (total * DASHA_YEARS[lord]) / 120;
    const start = new Date(t);
    t += years * 365.25 * 86400000;
    out.push({ lord, start, end: new Date(t), years });
  }
  return out;
}
export function dashaAt(chart: Chart, date: Date): { maha: DashaPeriod; antar: DashaPeriod } {
  const periods = vimshottariDasha(chart);
  const maha = periods.find((p) => date >= p.start && date < p.end) ?? periods[periods.length - 1];
  const antar = antardashas(chart, maha).find((p) => date >= p.start && date < p.end) ?? antardashas(chart, maha)[0];
  return { maha, antar };
}
export function yoginiDasha(chart: Chart): DashaPeriod[] {
  // Yogini dasha starts from the Moon's nakshatra: nakshatra 1-3 Mangala etc.
  // Sequence is 8 lords, 36-year cycle, starting lord by Moon nakshatra index.
  const moon = planetByName(chart, 'Moon');
  const startIdx = moon.nakshatraIdx % 8;
  const progress = (norm360(moon.sidereal) % (360 / 27)) / (360 / 27);
  const balance = YOGINI_YEARS[YOGINI_ORDER[startIdx]] * (1 - progress);
  const birth = chart.utc.getTime();
  const seq: { lord: string; years: number }[] = [{ lord: YOGINI_ORDER[startIdx], years: balance }];
  for (let i = 1; i < 24; i++) seq.push({ lord: YOGINI_ORDER[(startIdx + i) % 8], years: YOGINI_YEARS[YOGINI_ORDER[(startIdx + i) % 8]] });
  const out: DashaPeriod[] = [];
  let t = birth;
  for (const s of seq) {
    const start = new Date(t);
    t += s.years * 365.25 * 86400000;
    out.push({ lord: s.lord, start, end: new Date(t), years: s.years });
    if (t - birth > 108 * 365.25 * 86400000) break;
  }
  return out;
}
export const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
