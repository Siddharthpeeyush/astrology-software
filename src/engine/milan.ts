// Ashtakoot Milan (Kundli matching), 36 points, classical tables.
import { planetByName, type Chart } from './chart';
import { NAKSHATRAS } from './constants';

const VARNA: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
const SIGN_VARNA: Record<string, string> = { Cancer: 'Brahmin', Scorpio: 'Brahmin', Pisces: 'Brahmin', Aries: 'Kshatriya', Leo: 'Kshatriya', Sagittarius: 'Kshatriya', Taurus: 'Vaishya', Virgo: 'Vaishya', Capricorn: 'Vaishya', Gemini: 'Shudra', Libra: 'Shudra', Aquarius: 'Shudra' };
const VASHYA: Record<string, string[]> = {
  Aries: ['Leo', 'Scorpio'], Taurus: ['Cancer', 'Leo'], Gemini: ['Virgo'], Cancer: ['Scorpio', 'Sagittarius'],
  Leo: ['Libra'], Virgo: ['Pisces'], Libra: ['Capricorn'], Scorpio: ['Cancer'], Sagittarius: ['Pisces'],
  Capricorn: ['Aries'], Aquarius: ['Aries'], Pisces: ['Capricorn'],
};
const YONI_ANIMALS: Record<string, string> = { Ashwini: 'Horse', Bharani: 'Elephant', Krittika: 'Goat', Rohini: 'Serpent', Mrigashira: 'Serpent', Ardra: 'Dog', Punarvasu: 'Cat', Pushya: 'Goat', Ashlesha: 'Cat', Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', Hasta: 'Buffalo', Chitra: 'Tiger', Swati: 'Buffalo', Vishakha: 'Tiger', Anuradha: 'Deer', Jyeshtha: 'Deer', Mula: 'Dog', 'Purva Ashadha': 'Monkey', 'Uttara Ashadha': 'Mongoose', Shravana: 'Monkey', Dhanishta: 'Lion', Shatabhisha: 'Horse', 'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Cow', Revati: 'Elephant' };
const YONI_FRIENDLY: Record<string, string[]> = { Horse: ['Elephant', 'Buffalo'], Elephant: ['Horse', 'Lion'], Goat: ['Monkey', 'Cow'], Serpent: ['Deer', 'Mongoose'], Dog: ['Deer'], Cat: ['Rat'], Rat: ['Cat'], Cow: ['Goat', 'Tiger'], Buffalo: ['Horse', 'Cow'], Tiger: ['Cow', 'Monkey'], Deer: ['Serpent', 'Dog'], Monkey: ['Goat', 'Tiger'], Mongoose: ['Serpent'], Lion: ['Elephant', 'Horse'] };
const GANA: Record<string, string> = {};
NAKSHATRAS.forEach((n, i) => { GANA[n] = i % 3 === 0 ? 'Deva' : i % 3 === 1 ? 'Manushya' : 'Rakshasa'; });
const NADI: Record<string, string> = {};
NAKSHATRAS.forEach((n, i) => { NADI[n] = ['Adi', 'Madhya', 'Antya'][i % 3]; });

export interface KootaScore { name: string; points: number; max: number; detail: string }
export function ashtakoot(a: Chart, b: Chart): { total: number; kootas: KootaScore[]; verdict: string } {
  const ma = planetByName(a, 'Moon'); const mb = planetByName(b, 'Moon');
  const kootas: KootaScore[] = [];
  // Varna (1)
  const va = VARNA[SIGN_VARNA[ma.sign]]; const vb = VARNA[SIGN_VARNA[mb.sign]];
  kootas.push({ name: 'Varna', points: vb >= va ? 1 : 0, max: 1, detail: `${ma.sign} vs ${mb.sign}` });
  // Vashya (2)
  const vash = (VASHYA[ma.sign] ?? []).includes(mb.sign) || (VASHYA[mb.sign] ?? []).includes(ma.sign);
  kootas.push({ name: 'Vashya', points: vash ? 2 : 0, max: 2, detail: vash ? 'Mutual attraction' : 'No vashya' });
  // Tara (3)
  const tara = ((mb.nakshatraIdx - ma.nakshatraIdx + 27) % 27) % 9;
  const taraPts = [3, 1.5, 2, 3, 2.5, 1.5, 2, 3, 2.5][tara] ?? 0;
  kootas.push({ name: 'Tara', points: taraPts, max: 3, detail: `Count ${tara + 1} from ${ma.nakshatra}` });
  // Yoni (4)
  const ya = YONI_ANIMALS[ma.nakshatra]; const yb = YONI_ANIMALS[mb.nakshatra];
  const yoniPts = ya === yb ? 4 : (YONI_FRIENDLY[ya] ?? []).includes(yb) ? 3 : 2;
  kootas.push({ name: 'Yoni', points: yoniPts, max: 4, detail: `${ya} vs ${yb}` });
  // Graha Maitri (5)
  const lords = { Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'] } as Record<string, string[]>;
  const la = ma.nakshatraLord; const lb = mb.nakshatraLord;
  // Use Moon-sign lords instead (classical): sign lords of Moon signs.
  const signLords = { Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter' } as Record<string, string>;
  const sla = signLords[ma.sign]; const slb = signLords[mb.sign];
  const maitri = (lords[sla] ?? []).includes(slb) && (lords[slb] ?? []).includes(sla) ? 5 : (lords[sla] ?? []).includes(slb) || (lords[slb] ?? []).includes(sla) ? 4 : sla === slb ? 4 : 0;
  kootas.push({ name: 'Graha Maitri', points: maitri, max: 5, detail: `${sla} vs ${slb} (Moon-sign lords; nakshatra lords ${la}/${lb})` });
  // Gana (6)
  const ga = GANA[ma.nakshatra]; const gb = GANA[mb.nakshatra];
  const ganaPts = ga === gb ? 6 : (ga === 'Deva' && gb === 'Manushya') || (ga === 'Manushya' && gb === 'Deva') ? 5 : (ga === 'Manushya' && gb === 'Rakshasa') || (ga === 'Rakshasa' && gb === 'Manushya') ? 1 : 0;
  kootas.push({ name: 'Gana', points: ganaPts, max: 6, detail: `${ga} vs ${gb}` });
  // Bhakoot (7)
  const diff = Math.abs(ma.signIdx - mb.signIdx);
  // Classical Bhakoot dosha: Moon signs 2-12, 5-9 or 6-8 apart score 0, all others 7.
  const bhakootPts = [2, 5, 6, 8, 9, 12].includes(diff) ? 0 : 7;
  kootas.push({ name: 'Bhakoot', points: bhakootPts, max: 7, detail: diff === 0 ? 'Same sign' : `Moon signs ${diff} apart` });
  // Nadi (8)
  const nadiPts = NADI[ma.nakshatra] === NADI[mb.nakshatra] ? 0 : 8;
  kootas.push({ name: 'Nadi', points: nadiPts, max: 8, detail: `${NADI[ma.nakshatra]} vs ${NADI[mb.nakshatra]}` });
  const total = kootas.reduce((s, k) => s + k.points, 0);
  const verdict = total >= 28 ? 'Excellent match' : total >= 24 ? 'Good match' : total >= 18 ? 'Average — remedies advised' : 'Low — consult an astrologer before proceeding';
  return { total, kootas, verdict };
}
