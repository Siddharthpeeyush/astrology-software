// Core chart: tropical + sidereal (Lahiri) positions, Lagna, houses, dignity.
import { GRAHAS, NAKSHATRAS, NAKSHATRA_LORDS, PLANET_DEBIL, PLANET_EXALT, SIGN_LORDS, degInSign, fmtDeg, houseOf, norm360, signIndex, signOf, utcDateOf, type BirthInput } from './constants';
import { lahiriAyanamsa, sidereal } from './ayanamsa';
import { meanNodeLongitude, tropicalLongitude } from './astronomy';
import { placidusHouses } from './houses';

export interface PlanetPos {
  name: string; tropical: number; sidereal: number; sign: string; signIdx: number;
  degree: number; nakshatra: string; nakshatraIdx: number; pada: number;
  nakshatraLord: string; house: number; retrograde: boolean; dignity: string;
}
export interface Chart {
  input: BirthInput; utc: Date; ayanamsa: number;
  lagnaTropical: number; lagnaSidereal: number; lagnaSign: string;
  cuspsTropical: number[]; cuspsSidereal: number[];
  planets: PlanetPos[]; tropicalPlanets: Record<string, number>;
}
function nakshatraOf(lon: number) {
  const idx = Math.floor(norm360(lon) / (360 / 27));
  const within = norm360(lon) - idx * (360 / 27);
  return { idx, name: NAKSHATRAS[idx], lord: NAKSHATRA_LORDS[idx], pada: Math.floor(within / (360 / 108)) + 1 };
}
function dignity(name: string, sid: number): string {
  const ex = PLANET_EXALT[name]; const de = PLANET_DEBIL[name];
  if (ex !== undefined && Math.abs(norm360(sid - ex)) < 1) return 'Exalted';
  if (de !== undefined && Math.abs(norm360(sid - de)) < 1) return 'Debilitated';
  if (SIGN_LORDS[signIndex(sid)] === name) return 'Own sign';
  return '';
}
export function computeChart(input: BirthInput): Chart {
  const utc = utcDateOf(input);
  const ayan = lahiriAyanamsa(utc);
  const rahuT = meanNodeLongitude(utc);
  const planets: PlanetPos[] = [];
  const tropicalPlanets: Record<string, number> = {};
  const tropical: Record<string, number> = {};
  for (const g of GRAHAS) {
    let t: number;
    if (g === 'Rahu') t = rahuT;
    else if (g === 'Ketu') t = norm360(rahuT + 180);
    else t = tropicalLongitude(g, utc);
    tropical[g] = t; tropicalPlanets[g] = t;
  }
  const houses = placidusHouses(utc, input.latitude, input.longitude);
  const cuspsSidereal = houses.cusps.map((c) => sidereal(c, utc));
  const lagnaSid = sidereal(houses.ascendant, utc);
  for (const g of GRAHAS) {
    const sid = sidereal(tropical[g], utc);
    const nk = nakshatraOf(sid);
    // Retrograde: longitude decreasing over +/-1 day (outer planets + Mercury/Venus; Sun/Moon/nodes never).
    // Retrograde: centred-difference derivative of longitude, wrapped to
    // (-180, 180]; negative means the planet is moving backwards.
    let retro = false;
    if (g !== 'Sun' && g !== 'Moon' && g !== 'Rahu' && g !== 'Ketu') {
      const plus = tropicalLongitude(g, new Date(utc.getTime() + 86400000));
      const minus = tropicalLongitude(g, new Date(utc.getTime() - 86400000));
      retro = ((plus - minus + 540) % 360) - 180 < 0;
    }
    planets.push({
      name: g, tropical: tropical[g], sidereal: sid, sign: signOf(sid), signIdx: signIndex(sid),
      degree: degInSign(sid), nakshatra: nk.name, nakshatraIdx: nk.idx, pada: nk.pada,
      nakshatraLord: nk.lord, house: houseOf(sid, cuspsSidereal), retrograde: retro, dignity: dignity(g, sid),
    });
  }
  return {
    input, utc, ayanamsa: ayan, lagnaTropical: houses.ascendant, lagnaSidereal: lagnaSid,
    lagnaSign: signOf(lagnaSid), cuspsTropical: houses.cusps, cuspsSidereal,
    planets, tropicalPlanets,
  };
}
export const planetByName = (c: Chart, name: string) => c.planets.find((p) => p.name === name)!;
export const fmtPlanet = (p: PlanetPos) => `${p.name} — ${fmtDeg(p.sidereal)} · ${p.nakshatra} ${p.pada} · House ${p.house}${p.retrograde ? ' (R)' : ''}${p.dignity ? ` · ${p.dignity}` : ''}`;
