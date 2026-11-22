// Predictions — generated from the chart, never random text.
// Basis for every card: Moon sign, running Vimshottari Mahadasha/Antardasha,
// and today's transit houses from the natal Moon (Gochar).
import { planetByName, type Chart } from './chart';
import { dashaAt } from './dasha';
import { tropicalLongitude } from './astronomy';
import { sidereal } from './ayanamsa';
import { SIGNS } from './constants';

export interface PredictionCard { area: string; text: string; basis: string; tone: 'good' | 'mixed' | 'careful' }
function transitHouseFromMoon(chart: Chart, planet: string, date: Date): number {
  const moon = planetByName(chart, 'Moon');
  const lon = sidereal(tropicalLongitude(planet, date), date);
  const sign = Math.floor(lon / 30);
  return ((sign - moon.signIdx) % 12 + 12) % 12 + 1;
}
function houseQuality(house: number): 'good' | 'mixed' | 'careful' {
  return [3, 6, 10, 11].includes(house) ? 'good' : [1, 2, 4, 5, 7, 9].includes(house) ? 'mixed' : 'careful';
}
export function predictionsFor(chart: Chart, date = new Date()): PredictionCard[] {
  const { maha, antar } = dashaAt(chart, date);
  const moon = planetByName(chart, 'Moon');
  const jupH = transitHouseFromMoon(chart, 'Jupiter', date);
  const satH = transitHouseFromMoon(chart, 'Saturn', date);
  const sunH = transitHouseFromMoon(chart, 'Sun', date);
  const venH = transitHouseFromMoon(chart, 'Venus', date);
  const basis = `${maha.lord} Mahadasha, ${antar.lord} Antardasha; Jupiter ${jupH}th, Saturn ${satH}th from Moon (${moon.sign})`;
  const mk = (area: string, text: string, tone: 'good' | 'mixed' | 'careful'): PredictionCard => ({ area, text, basis, tone });
  return [
    mk('Career', jupH === 10 || jupH === 11 ? `Jupiter transits the ${jupH}th from your Moon — a favourable window for recognition, promotion or a new role. ${maha.lord} Mahadasha supports steady effort.` : satH === 10 ? 'Saturn transits the 10th from your Moon — heavy workload and responsibility; effort now builds reputation later.' : `Career moves are steady rather than dramatic now. Focus on skill and consistency during ${maha.lord} Mahadasha.`, houseQuality(jupH)),
    mk('Love / Marriage', venH === 7 || venH === 11 ? `Venus transits the ${venH}th from your Moon — a good period for relationships and, if eligible, marriage talks.` : venH === 5 ? 'Venus in the 5th from your Moon favours romance and warmth in existing relationships.' : `Relationships need patience and clear communication now. Avoid rushing marriage decisions while Venus is in the ${venH}th from your Moon.`, houseQuality(venH)),
    mk('Health', satH === 6 ? 'Saturn in the 6th from your Moon helps recovery and discipline — a good time to fix routines.' : satH === 8 || satH === 12 ? 'Saturn in a difficult house from your Moon — watch fatigue, joints and sleep; keep routines regular and do not ignore small symptoms.' : `Health is generally stable. Keep sleep and food regular during ${antar.lord} Antardasha.`, houseQuality(satH)),
    mk('Money', jupH === 2 || jupH === 11 ? `Jupiter in the ${jupH}th from your Moon supports income and gains — a good time to plan, save and close pending payments.` : sunH === 11 ? 'The Sun in the 11th from your Moon supports gains through effort and authority.' : `Money needs budgeting now — avoid large speculative spending while Jupiter is in the ${jupH}th from your Moon.`, houseQuality(jupH)),
  ];
}
export function dailyText(chart: Chart, date = new Date()): { text: string; basis: string } {
  const moon = planetByName(chart, 'Moon');
  const { maha, antar } = dashaAt(chart, date);
  const todayMoonSign = SIGNS[Math.floor(sidereal(tropicalLongitude('Moon', date), date) / 30)];
  return {
    text: `Moon transits ${todayMoonSign} today, ${((Math.floor(sidereal(tropicalLongitude('Moon', date), date) / 30) - moon.signIdx) % 12 + 12) % 12 + 1}th from your natal Moon (${moon.sign}). ${maha.lord} Mahadasha / ${antar.lord} Antardasha is running.`,
    basis: `Transit Moon sign + running Dasha (${maha.lord}/${antar.lord})`,
  };
}
