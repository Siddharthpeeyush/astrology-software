// Dosha detection (rule-based, from the computed chart) + traditional remedies.
// Remedies are traditional astrological suggestions, not medical advice.
import { planetByName, type Chart } from './chart';
import { dashaAt } from './dasha';
import { tropicalLongitude } from './astronomy';
import { sidereal } from './ayanamsa';

export interface Dosha { name: string; present: boolean; severity: string; detail: string; remedies: string[] }
export function detectDoshas(chart: Chart): Dosha[] {
  const mars = planetByName(chart, 'Mars');
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglik = manglikHouses.includes(mars.house);
  const rahu = planetByName(chart, 'Rahu'); const ketu = planetByName(chart, 'Ketu');
  // Kaal Sarp: all 7 planets between Rahu and Ketu on one side of the axis.
  const axis = rahu.sidereal;
  const rel = chart.planets.filter((p) => !['Rahu', 'Ketu'].includes(p.name)).map((p) => ((p.sidereal - axis) % 360 + 360) % 360);
  const kaalSarp = rel.every((r) => r < 180) || rel.every((r) => r > 180);
  const saturn = planetByName(chart, 'Saturn');
  const moon = planetByName(chart, 'Moon');
  // Sade Sati: Saturn transiting 12th, 1st or 2nd from natal Moon (at birth, Saturn's natal position is used as the reference for the current phase check in predictions; here we report the natal Saturn-Moon relationship).
  const satFromMoon = ((saturn.signIdx - moon.signIdx) % 12 + 12) % 12;
  const sadeSatiNatal = [11, 0, 1].includes(satFromMoon);
  const { maha } = dashaAt(chart, new Date());
  return [
    { name: 'Manglik Dosha', present: manglik, severity: manglik ? 'Present' : 'Absent',
      detail: manglik ? `Mars in house ${mars.house} (${mars.sign})` : `Mars in house ${mars.house} — not in 1, 2, 4, 7, 8 or 12`,
      remedies: manglik ? ['Chant Mangal mantra / Hanuman Chalisa on Tuesdays', 'Fast on Tuesdays if health permits', 'Kumbh Vivah / Manglik matching before marriage is traditionally advised', 'Donate red lentils (masoor dal) on Tuesdays'] : [] },
    { name: 'Kaal Sarp Dosha', present: kaalSarp, severity: kaalSarp ? 'Present' : 'Absent',
      detail: kaalSarp ? `All planets lie on one side of the Rahu-Ketu axis (${rahu.sign}–${ketu.sign})` : 'Planets are spread on both sides of the Rahu-Ketu axis',
      remedies: kaalSarp ? ['Rudra Abhishek / Kaal Sarp Shanti puja', 'Chant Maha Mrityunjaya mantra', 'Offer water to Shivling on Mondays', 'Feed ants / birds regularly'] : [] },
    { name: 'Sade Sati (natal Saturn–Moon)', present: sadeSatiNatal, severity: sadeSatiNatal ? 'Saturn close to Moon sign' : 'Absent',
      detail: `Saturn is ${satFromMoon === 0 ? 'in the Moon sign' : `${satFromMoon} signs from Moon`} (${moon.sign}); current Mahadasha: ${maha.lord}`,
      remedies: sadeSatiNatal ? ['Chant Shani mantra on Saturdays', 'Donate black sesame / oil on Saturdays', 'Serve the elderly and the needy', 'Wear iron / avoid haste in big decisions during Saturn transits'] : [] },
  ];
}
export function currentSadeSati(chart: Chart, date = new Date()): { active: boolean; phase: string; detail: string } {
  const moon = planetByName(chart, 'Moon');
  const satSid = sidereal(tropicalLongitude('Saturn', date), date);
  const satSign = Math.floor(satSid / 30);
  const diff = ((satSign - moon.signIdx) % 12 + 12) % 12;
  if (diff === 11) return { active: true, phase: 'Rising phase (12th from Moon)', detail: `Saturn transiting ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][satSign]}, 12th from natal Moon ${moon.sign}` };
  if (diff === 0) return { active: true, phase: 'Peak phase (over natal Moon)', detail: `Saturn transiting natal Moon sign ${moon.sign}` };
  if (diff === 1) return { active: true, phase: 'Setting phase (2nd from Moon)', detail: `Saturn transiting 2nd from natal Moon ${moon.sign}` };
  return { active: false, phase: 'Not active', detail: `Saturn is ${diff} signs from natal Moon ${moon.sign}` };
}
