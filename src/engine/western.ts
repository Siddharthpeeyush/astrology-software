// Western: tropical positions, aspects, Sun/Moon/Rising.
import { norm360, signOf } from './constants';
import type { Chart } from './chart';

export interface Aspect { p1: string; p2: string; type: string; orb: number; exact: number }
const ASPECTS = [{ type: 'Conjunction', angle: 0, orb: 8 }, { type: 'Sextile', angle: 60, orb: 6 }, { type: 'Square', angle: 90, orb: 7 }, { type: 'Trine', angle: 120, orb: 8 }, { type: 'Opposition', angle: 180, orb: 8 }];
export function westernAspects(chart: Chart): Aspect[] {
  const out: Aspect[] = [];
  const ps = chart.planets.filter((p) => p.name !== 'Rahu' && p.name !== 'Ketu');
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const diff = Math.abs(norm360(ps[i].tropical - ps[j].tropical));
    const d = Math.min(diff, 360 - diff);
    for (const a of ASPECTS) {
      const orb = Math.abs(d - a.angle);
      if (orb <= a.orb) out.push({ p1: ps[i].name, p2: ps[j].name, type: a.type, orb: Math.round(orb * 10) / 10, exact: Math.round(d * 10) / 10 });
    }
  }
  return out;
}
export function westernSummary(chart: Chart) {
  const sun = chart.planets.find((p) => p.name === 'Sun')!;
  const moon = chart.planets.find((p) => p.name === 'Moon')!;
  return {
    sunSign: signOf(sun.tropical), moonSign: signOf(moon.tropical),
    risingSign: signOf(chart.lagnaTropical),
    sunTropical: sun.tropical, moonTropical: moon.tropical, ascTropical: chart.lagnaTropical,
  };
}
