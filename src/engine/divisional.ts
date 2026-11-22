// 16 divisional (Varga) charts, Parashara formulas.
// Each returns, per planet, the varga sign index (0-11) and sign name.
// D1 Rasi, D2 Hora, D3 Drekkana, D4 Chaturthamsa, D7 Saptamsa, D9 Navamsa,
// D10 Dasamsa, D12 Dwadasamsa, D16 Shodasamsa, D20 Vimsamsa, D24 Chaturvimsamsa,
// D27 Bhamsa, D30 Trimsamsa, D40 Khavedamsa, D45 Akshavedamsa, D60 Shashtiamsa.
import { SIGNS, norm360 } from './constants';
import type { Chart } from './chart';

export const VARGAS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];
const odd = (s: number) => s % 2 === 0; // sign index 0 = Aries (odd sign in Vedic counting)
function vargaSign(lon: number, v: number): number {
  const s = Math.floor(norm360(lon) / 30); // 0-11
  const d = norm360(lon) % 30;
  const o = odd(s);
  switch (v) {
    case 1: return s;
    case 2: { // Hora: Sun hora / Moon hora
      const half = d < 15 ? 0 : 1;
      if (o) return half === 0 ? 4 : 3; // odd sign: 1st half Leo, 2nd Cancer
      return half === 0 ? 3 : 4; // even sign: 1st half Cancer, 2nd Leo
    }
    case 3: { // Drekkana: sign itself, +4, +8
      const part = Math.floor(d / 10);
      return (s + 4 * part) % 12;
    }
    case 4: { // Chaturthamsa: 4 parts of 7.5 deg, from sign / from 4th / 7th / 10th
      const part = Math.floor(d / 7.5);
      return (s + [0, 3, 6, 9][part]) % 12;
    }
    case 7: { // Saptamsa: 7 parts; odd signs count forward from sign, even from 7th
      const part = Math.floor(d / (30 / 7));
      return o ? (s + part) % 12 : (s + 6 + part) % 12;
    }
    case 9: { // Navamsa: 9 parts of 3.33 deg; movable signs from sign, fixed from 9th, dual from 5th
      const part = Math.floor(d / (30 / 9));
      const kind = s % 3; // 0 movable (Aries, Cancer, Libra, Capricorn), 1 fixed, 2 dual
      const base = kind === 0 ? s : kind === 1 ? (s + 8) % 12 : (s + 4) % 12;
      return (base + part) % 12;
    }
    case 10: { // Dasamsa: 10 parts; odd from sign, even from 9th
      const part = Math.floor(d / 3);
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 12: { // Dwadasamsa: 12 parts of 2.5 deg, from the sign itself
      const part = Math.floor(d / 2.5);
      return (s + part) % 12;
    }
    case 16: { // Shodasamsa: 16 parts; odd from sign, even from 9th... classical: odd from sign, even from 9th from sign (same pattern as Dasamsa with 16 parts)
      const part = Math.floor(d / (30 / 16));
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 20: { // Vimsamsa: 20 parts; odd from sign, even from 9th
      const part = Math.floor(d / 1.5);
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 24: { // Chaturvimsamsa: 24 parts; odd from sign, even from 9th
      const part = Math.floor(d / 1.25);
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 27: { // Bhamsa (Nakshatramsa): 27 parts, from the sign of the nakshatra lord's... simplified classical: count from sign by part
      const part = Math.floor(d / (30 / 27));
      return (s + part) % 12;
    }
    case 30: { // Trimsamsa: 5 parts of 6 deg; odd signs: Aries, Aquarius, Sagittarius, Gemini, Libra; even: Taurus, Virgo, Pisces, Capricorn, Scorpio
      const part = Math.floor(d / 6);
      if (o) return [0, 10, 8, 2, 6][part] ?? 6;
      return [1, 5, 11, 9, 7][part] ?? 7;
    }
    case 40: { // Khavedamsa: 40 parts; odd from sign, even from 9th
      const part = Math.floor(d / 0.75);
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 45: { // Akshavedamsa: 45 parts; odd from sign, even from 9th
      const part = Math.floor(d / (30 / 45));
      return o ? (s + part) % 12 : (s + 8 + part) % 12;
    }
    case 60: { // Shashtiamsa: 60 parts of 0.5 deg, from the sign itself
      const part = Math.floor(d / 0.5);
      return (s + part) % 12;
    }
    default: return s;
  }
}
export function divisionalChart(chart: Chart, v: number): { varga: number; planets: { name: string; signIdx: number; sign: string }[]; lagnaSignIdx: number; lagnaSign: string } {
  return {
    varga: v,
    planets: chart.planets.map((p) => { const idx = vargaSign(p.sidereal, v); return { name: p.name, signIdx: idx, sign: SIGNS[idx] }; }),
    lagnaSignIdx: vargaSign(chart.lagnaSidereal, v),
    lagnaSign: SIGNS[vargaSign(chart.lagnaSidereal, v)],
  };
}
export function allDivisional(chart: Chart) { return VARGAS.map((v) => divisionalChart(chart, v)); }
