// Gemstone recommendation + Muhurat finder.
// Gems: based on Lagna lord (favourable) and the weakest planet by the
// simplified Shadbala + dignity. Where numerology and astrology disagree,
// the UI shows both and says so — this module returns the astrology side;
// numerology lucky gem is computed separately in numerology.ts.
import { planetByName, type Chart } from './chart';
import { SIGN_LORDS } from './constants';
import { shadbala } from './shadbala';
import { panchangFor, isPanchaka } from './panchang';
export const GEMSTONES: Record<string, { stone: string; metal: string; finger: string }> = {
  Sun: { stone: 'Ruby (Manik)', metal: 'Gold', finger: 'Ring finger' },
  Moon: { stone: 'Pearl (Moti)', metal: 'Silver', finger: 'Little finger' },
  Mars: { stone: 'Red Coral (Moonga)', metal: 'Copper', finger: 'Ring finger' },
  Mercury: { stone: 'Emerald (Panna)', metal: 'Gold', finger: 'Little finger' },
  Jupiter: { stone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', finger: 'Index finger' },
  Venus: { stone: 'Diamond (Heera) / Opal', metal: 'Silver', finger: 'Middle finger' },
  Saturn: { stone: 'Blue Sapphire (Neelam)', metal: 'Iron / Panchdhatu', finger: 'Middle finger' },
};
export function gemRecommendations(chart: Chart): { planet: string; reason: string; stone: string; metal: string; finger: string; caution: boolean }[] {
  const lagnaLord = SIGN_LORDS[Math.floor(chart.lagnaSidereal / 30)];
  const bala = shadbala(chart);
  const weakest = [...bala].sort((a, b) => a.total - b.total)[0];
  const out: { planet: string; reason: string; stone: string; metal: string; finger: string; caution: boolean }[] = [];
  out.push({ planet: lagnaLord, reason: `Lagna lord — generally favourable for ${chart.lagnaSign} Lagna`, ...GEMSTONES[lagnaLord], caution: false });
  const weakPlanet = planetByName(chart, weakest.planet);
  if (weakest.planet !== lagnaLord) {
    out.push({ planet: weakest.planet, reason: `Weakest by simplified Shadbala (${weakest.total} pts${weakPlanet.dignity ? `, ${weakPlanet.dignity}` : ''}) — strengthening stone, only after a trial`, ...GEMSTONES[weakest.planet], caution: true });
  }
  return out;
}
export interface MuhuratDay { date: Date; score: number; tithi: string; nakshatra: string; moonSign: string; notes: string[] }
export function findMuhurat(lat: number, lon: number, days = 30): MuhuratDay[] {
  // Scan the next `days` days; score by tithi, nakshatra, Moon sign and
  // absence of Panchaka, using the Panchang engine.
  const out: MuhuratDay[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const p = panchangFor(d, lat, lon);
    let score = 0; const notes: string[] = [];
    if (['Shukla Paksha'].includes(p.paksha)) { score += 1; notes.push('Shukla Paksha'); }
    if (['Rohini', 'Pushya', 'Hasta', 'Shravana', 'Anuradha', 'Uttara Phalguni'].includes(p.nakshatra)) { score += 2; notes.push(`Auspicious nakshatra ${p.nakshatra}`); }
    if (['Taurus', 'Cancer', 'Leo', 'Virgo', 'Libra'].includes(p.moonSign)) { score += 1; notes.push(`Moon in ${p.moonSign}`); }
    if (isPanchaka(d)) { score -= 3; notes.push('Panchaka — avoid'); }
    if (['Vishti'].includes(p.karana)) { score -= 1; notes.push('Vishti karana'); }
    out.push({ date: d, score, tithi: `${p.tithi} (${p.paksha})`, nakshatra: p.nakshatra, moonSign: p.moonSign, notes });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 7);
}
