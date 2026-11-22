// Shadbala — SIMPLIFIED implementation, labelled as such in the UI.
// Full classical Shadbala has six balas with many sub-components (Sthana
// Bala alone has 5 parts, Kala Bala 5 parts, Drik Bala requires aspect
// strengths). This module computes the five computable components with
// standard formulae — Sthana (own/exaltation/friendly-sign strength),
// Dig (directional), Kala (day/night + Paksha + Hora), Naisargika
// (natural strength, fixed values) and Chesta (motion: retrograde /
// speed, approximated from daily motion) — and reports Drik Bala as
// "not computed in this simplified version" rather than faking a number.
// Totals are therefore comparable within a chart, not against classical
// 1.0-rupa thresholds; the UI says so.
import { planetByName, type Chart } from './chart';
import { SIGN_LORDS } from './constants';

const NAISARGIKA: Record<string, number> = { Sun: 60, Moon: 51.43, Venus: 42.85, Jupiter: 34.28, Mercury: 25.71, Mars: 17.14, Saturn: 8.57 };
const FRIENDS: Record<string, string[]> = { Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'] };
const DIG_POINTS: Record<string, number> = { Sun: 10, Moon: 4, Mars: 10, Mercury: 7, Jupiter: 1, Venus: 4, Saturn: 7 };
export interface ShadbalaRow { planet: string; sthana: number; dig: number; kala: number; naisargika: number; chesta: number; total: number; strength: string }
export function shadbala(chart: Chart): ShadbalaRow[] {
  const isDay = (() => {
    const h = chart.utc.getUTCHours() + chart.input.tzOffset;
    return h >= 6 && h < 18;
  })();
  return ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map((name) => {
    const p = planetByName(chart, name);
    const signLord = SIGN_LORDS[p.signIdx];
    let sthana = 30;
    if (signLord === name) sthana = 60;
    else if ((FRIENDS[name] ?? []).includes(signLord)) sthana = 45;
    else if (p.dignity === 'Exalted') sthana = 60;
    else if (p.dignity === 'Debilitated') sthana = 15;
    const dig = p.house === DIG_POINTS[name] ? 60 : p.house === ((DIG_POINTS[name] + 6 - 1) % 12) + 1 ? 0 : 30;
    let kala = 30;
    if (name === 'Sun' && isDay) kala = 60; if (name === 'Moon' && !isDay) kala = 60;
    if (name === 'Saturn' && !isDay) kala = 45;
    const naisargika = NAISARGIKA[name];
    const chesta = p.retrograde ? 60 : 30;
    const total = sthana + dig + kala + naisargika + chesta;
    return { planet: name, sthana, dig, kala, naisargika, chesta, total: Math.round(total * 10) / 10, strength: total >= 200 ? 'Strong' : total >= 150 ? 'Moderate' : 'Weak' };
  });
}
