// Horary / Prashna — a chart for the moment a question is asked.
// Lagna for that moment, Lagna lord, Moon, and the 7th/11th houses give
// a leaning. Labelled as Prashna tradition; it is an indication, not a
// guarantee. No random answer — it is computed from the moment's chart.
import { computeChart } from './chart';
import { planetByName } from './chart';
import { SIGN_LORDS } from './constants';
import type { BirthInput } from './constants';

export interface PrashnaResult { lagna: string; lagnaLord: string; moonSign: string; moonHouse: number; answer: 'Yes' | 'Leaning yes' | 'Leaning no' | 'No'; score: number; basis: string[] }
export function prashna(question: string, when: Date, lat: number, lon: number, tzOffset: number, place: string): PrashnaResult {
  const local = new Date(when.getTime() + tzOffset * 3600000);
  const input: BirthInput = { name: 'Prashna', date: local.toISOString().slice(0, 10), time: `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`, place, latitude: lat, longitude: lon, tzOffset };
  const chart = computeChart(input);
  const lagnaLord = SIGN_LORDS[Math.floor(chart.lagnaSidereal / 30)];
  const lagnaLordPlanet = planetByName(chart, lagnaLord);
  const moon = planetByName(chart, 'Moon');
  const basis: string[] = [];
  let score = 0;
  // Lagna lord in a Kendra/Trikona (1,4,5,7,9,10,11) is favourable.
  if ([1, 4, 5, 7, 9, 10, 11].includes(lagnaLordPlanet.house)) { score += 2; basis.push(`Lagna lord ${lagnaLord} is in house ${lagnaLordPlanet.house} (a favourable house)`); }
  else { score -= 1; basis.push(`Lagna lord ${lagnaLord} is in house ${lagnaLordPlanet.house} (a difficult house)`); }
  if ([1, 4, 5, 7, 9, 10, 11].includes(moon.house)) { score += 1; basis.push(`Moon is in house ${moon.house} (${moon.sign})`); }
  else { score -= 1; basis.push(`Moon is in house ${moon.house} (${moon.sign})`); }
  if (moon.house === 7 || moon.house === 11) { score += 1; basis.push('Moon in the 7th/11th supports the matter'); }
  if (lagnaLordPlanet.dignity === 'Exalted' || lagnaLordPlanet.dignity === 'Own sign') { score += 1; basis.push(`Lagna lord is ${lagnaLordPlanet.dignity}`); }
  if (lagnaLordPlanet.dignity === 'Debilitated') { score -= 1; basis.push('Lagna lord is debilitated'); }
  const answer: PrashnaResult['answer'] = score >= 3 ? 'Yes' : score >= 1 ? 'Leaning yes' : score >= -1 ? 'Leaning no' : 'No';
  void question;
  return { lagna: chart.lagnaSign, lagnaLord, moonSign: moon.sign, moonHouse: moon.house, answer, score, basis };
}
