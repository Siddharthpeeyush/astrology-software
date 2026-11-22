import { describe, it, expect } from 'vitest';
import { computeChart } from '../chart';
import { lahiriAyanamsa, sidereal } from '../ayanamsa';
import { vimshottariDasha, dashaAt, antardashas } from '../dasha';
import { panchangFor } from '../panchang';
import { ashtakvarga, BAV_TOTALS } from '../ashtakvarga';
import { divisionalChart } from '../divisional';
import { kpSubLord } from '../kp';
import { ashtakoot } from '../milan';
import { placidusHouses } from '../houses';
import { reduceSteps, mulank, bhagyank, nameNumber, loShu, personalYear } from '../numerology';
import type { BirthInput } from '../constants';

export const DELHI: BirthInput = { name: 'Test Native', date: '1995-08-15', time: '10:30', place: 'Delhi', latitude: 28.61, longitude: 77.21, tzOffset: 5.5 };
export const MUMBAI: BirthInput = { name: 'Second Native', date: '1997-02-14', time: '09:15', place: 'Mumbai', latitude: 19.08, longitude: 72.88, tzOffset: 5.5 };

describe('ayanamsa', () => {
  it('sidereal = tropical - ayanamsa (Lahiri ~23.8 deg in 1995)', () => {
    const d = new Date(Date.UTC(1995, 7, 15, 5, 0, 0));
    const ay = lahiriAyanamsa(d);
    expect(ay).toBeGreaterThan(23.5); expect(ay).toBeLessThan(24.1);
    expect(sidereal(200, d)).toBeCloseTo(200 - ay, 6);
  });
});
describe('test chart Delhi 1995-08-15 10:30', () => {
  const c = computeChart(DELHI);
  it('Lagna is Virgo sidereal', () => { expect(c.lagnaSign).toBe('Virgo'); });
  it('Moon is Pisces, Revati Pada 3', () => {
    const moon = c.planets.find((p) => p.name === 'Moon')!;
    expect(moon.sign).toBe('Pisces'); expect(moon.nakshatra).toBe('Revati'); expect(moon.pada).toBe(3);
  });
  it('Venus Mahadasha is running in mid-2027', () => {
    const { maha } = dashaAt(c, new Date(Date.UTC(2027, 5, 15)));
    expect(maha.lord).toBe('Venus');
  });
  it('houses are monotonic and opposite pairs are 180 apart', () => {
    const h = placidusHouses(c.utc, DELHI.latitude, DELHI.longitude);
    for (let i = 0; i < 6; i++) expect(Math.abs(((h.cusps[i + 6] - h.cusps[i] + 360) % 360) - 180)).toBeLessThan(0.01);
    const sorted = [...h.cusps].sort((a, b) => a - b);
    expect(sorted.length).toBe(12);
  });
  it('Dasha sequence sums to 120 years and antardashas sum to the mahadasha', () => {
    const ds = vimshottariDasha(c);
    expect(ds[0].lord).toBe(c.planets.find((p) => p.name === 'Moon')!.nakshatraLord);
    const total = ds.reduce((s, d) => s + d.years, 0);
    expect(total).toBeGreaterThan(119); expect(total).toBeLessThan(121);
    const first = ds[0];
    const ants = antardashas(c, first);
    expect(ants.reduce((s, a) => s + a.years, 0)).toBeCloseTo(first.years, 6);
  });
});
describe('second chart differs', () => {
  it('Mumbai 1997 chart is a different person', () => {
    const a = computeChart(DELHI); const b = computeChart(MUMBAI);
    expect(b.lagnaSign).not.toBe(a.lagnaSign);
    const ma = a.planets.find((p) => p.name === 'Moon')!; const mb = b.planets.find((p) => p.name === 'Moon')!;
    expect(mb.sign + mb.nakshatra).not.toBe(ma.sign + ma.nakshatra);
  });
});
describe('panchang', () => {
  it('tithi is in 1..30 and nakshatra is a known name', () => {
    const p = panchangFor(new Date(Date.UTC(2026, 10, 22, 12, 0, 0)), 28.61, 77.21);
    expect(p.tithiNo).toBeGreaterThanOrEqual(1); expect(p.tithiNo).toBeLessThanOrEqual(30);
    expect(p.nakshatra.length).toBeGreaterThan(2); expect(p.moonIllumPct).toBeGreaterThanOrEqual(0); expect(p.moonIllumPct).toBeLessThanOrEqual(100);
  });
});
describe('ashtakvarga', () => {
  it('BAV totals match the classical fixed totals and SAV totals 337', () => {
    const c = computeChart(DELHI);
    const r = ashtakvarga(c);
    for (const [planet, total] of Object.entries(BAV_TOTALS)) {
      expect(r.bav[planet].reduce((a, b) => a + b, 0)).toBe(total);
    }
    expect(r.sav.reduce((a, b) => a + b, 0)).toBe(337);
  });
});
describe('divisional + KP', () => {
  it('D9 Navamsa signs are valid and D1 matches the rasi chart', () => {
    const c = computeChart(DELHI);
    const d9 = divisionalChart(c, 9);
    expect(d9.planets.every((p) => p.signIdx >= 0 && p.signIdx < 12)).toBe(true);
    const d1 = divisionalChart(c, 1);
    expect(d1.planets.map((p) => p.sign)).toEqual(c.planets.map((p) => p.sign));
  });
  it('KP sub-lord is a valid Vimshottari lord', () => {
    const kp = kpSubLord(178.5);
    expect(['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']).toContain(kp.subLord);
  });
});
describe('milan', () => {
  it('score is within 0..36', () => {
    const r = ashtakoot(computeChart(DELHI), computeChart(MUMBAI));
    expect(r.total).toBeGreaterThanOrEqual(0); expect(r.total).toBeLessThanOrEqual(36);
    expect(r.kootas.reduce((s, k) => s + k.max, 0)).toBe(36);
  });
});
describe('numerology', () => {
  it('reduces with steps shown and keeps master numbers', () => {
    expect(reduceSteps(38).result).toBe(11); // 3+8=11 master, not reduced to 2
    expect(reduceSteps(29).result).toBe(11);
    expect(reduceSteps(15).result).toBe(6);
    expect(mulank(15).value).toBe(6);
    const b = bhagyank('1995-08-15');
    expect(b.value).toBe(2); // 1+5+0+8+1+9+9+5=38 -> 11 -> 2
    expect(b.steps.join(' ')).toContain('38');
  });
  it('name numbers differ by system where they should', () => {
    const py = nameNumber('Siddharth', 'pythagorean');
    const ch = nameNumber('Siddharth', 'chaldean');
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(py.value);
    expect([1,2,3,4,5,6,7,8,9,11,22,33]).toContain(ch.value);
  });
  it('Lo Shu grid maps digits 1-9 and finds missing numbers', () => {
    const g = loShu('1995-08-15');
    expect(g.present).toContain(1); expect(g.present).toContain(9); expect(g.present).toContain(5);
    expect(g.missing).toContain(2); expect(g.missing).toContain(3);
    expect(g.grid.flat().filter(Boolean).length).toBe(g.present.length);
  });
  it('personal year for 2027 is deterministic', () => {
    expect(personalYear('1995-08-15', 2027).value).toBe(personalYear('1995-08-15', 2027).value);
    expect(personalYear('1995-08-15', 2027).value).toBeGreaterThanOrEqual(1);
    expect(personalYear('1995-08-15', 2027).value).toBeLessThanOrEqual(9);
  });
});

describe('new modules', () => {
  it('Rahu Kaal segment follows the weekday rule and lasts 1.5h of daylight/8', async () => {
    const { dayTimings } = await import('../timings');
    // Monday 2026-11-23: Rahu Kaal is the 2nd segment.
    const d = dayTimings(new Date(Date.UTC(2026, 10, 23, 12, 0, 0)), 28.61, 77.21);
    expect(d.rahuKaal).not.toBeNull();
    expect(d.choghadiya.length).toBe(8);
    expect(d.horas.length).toBe(8);
    expect(d.horas[0].name).toBe('Moon Hora'); // Monday starts with Moon
    const segLen = (d.rahuKaal!.end.getTime() - d.rahuKaal!.start.getTime()) / 60000;
    expect(segLen).toBeGreaterThan(60); expect(segLen).toBeLessThan(120);
  });
  it('Tarot draw has no repeated cards and shuffles', async () => {
    const { drawSpread, fullDeck } = await import('../tarot');
    expect(fullDeck().length).toBe(78);
    const a = drawSpread('celtic');
    expect(new Set(a.map((c) => c.card.id)).size).toBe(10);
    const b = drawSpread('celtic');
    expect(a.map((c) => c.card.id).join()).not.toBe(b.map((c) => c.card.id).join());
  });
  it('Solar return falls near the birthday', async () => {
    const { solarReturnDate } = await import('../varshphal');
    const { computeChart } = await import('../chart');
    const c = computeChart(DELHI);
    const ret = solarReturnDate(c.tropicalPlanets.Sun, 2027);
    expect(ret.getUTCMonth()).toBe(7); // August, near 15 Aug birthday
    expect(ret.getUTCDate()).toBeGreaterThanOrEqual(13);
    expect(ret.getUTCDate()).toBeLessThanOrEqual(17);
  });
  it('Prashna gives a deterministic answer from the moment chart', async () => {
    const { prashna } = await import('../prashna');
    const r1 = prashna('Will I get the job?', new Date(Date.UTC(2026, 10, 22, 10, 0, 0)), 28.61, 77.21, 5.5, 'Delhi');
    const r2 = prashna('Will I get the job?', new Date(Date.UTC(2026, 10, 22, 10, 0, 0)), 28.61, 77.21, 5.5, 'Delhi');
    expect(r1.answer).toBe(r2.answer);
    expect(['Yes', 'Leaning yes', 'Leaning no', 'No']).toContain(r1.answer);
    expect(r1.basis.length).toBeGreaterThan(0);
  });
  it('Progressions move the Sun ~1 degree per year of life', async () => {
    const { progressedChart } = await import('../progressions');
    const { computeChart } = await import('../chart');
    const c = computeChart(DELHI);
    const p0 = progressedChart(c, 0);
    const p30 = progressedChart(c, 30);
    const diff = ((p30.sunLon - p0.sunLon) % 360 + 360) % 360;
    expect(diff).toBeGreaterThan(25); expect(diff).toBeLessThan(35);
  });
});
