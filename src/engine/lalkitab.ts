// Lal Kitab — BASIC module, labelled as such.
// Lal Kitab uses the same planet-in-house positions as the Lagna chart,
// with its own house significations, blind planets, and the 35-year
// Lal Kitab dasha (based on the Moon's house). Full Lal Kitab Varshphal
// and debt (rin) analysis are NOT claimed here — see README.
import { planetByName, type Chart } from './chart';
export const LAL_KITAB_HOUSES = [
  'Self, health, head', 'Wealth, family, speech', 'Siblings, courage, arms', 'Mother, home, land',
  'Children, education, intellect', 'Enemies, disease, debts', 'Spouse, partnership', 'Longevity, sudden events',
  'Fortune, father, dharma', 'Career, karma, status', 'Gains, friends, elder siblings', 'Losses, foreign, moksha',
];
export interface LalKitabRow { planet: string; house: number; signification: string; remedy: string }
const REMEDIES: Record<string, string> = {
  Sun: 'Offer water to the Sun at sunrise; keep a copper vessel at home.',
  Moon: 'Keep silver with you; respect your mother; offer milk on Mondays.',
  Mars: 'Feed sweet rotis to dogs; keep a red handkerchief; respect brothers.',
  Mercury: 'Feed green fodder to cows; keep a parrot feather / green cloth.',
  Jupiter: 'Apply saffron tilak; respect teachers and elders; donate turmeric.',
  Venus: 'Keep the house clean and fragrant; respect women; donate white sweets.',
  Saturn: 'Serve the poor and old; donate mustard oil on Saturdays.',
  Rahu: 'Keep a coconut in flowing water; feed ants; avoid blue/black on important days.',
  Ketu: 'Feed dogs; keep a black-and-white blanket; donate sesame on Tuesdays.',
};
export function lalKitab(chart: Chart): { rows: LalKitabRow[]; blindPlanets: string[]; dasha35: { planet: string; startAge: number; endAge: number }[] } {
  const rows = chart.planets.map((p) => ({ planet: p.name, house: p.house, signification: LAL_KITAB_HOUSES[p.house - 1], remedy: REMEDIES[p.name] }));
  // Blind planets (Lal Kitab): planets in houses where they are considered blind — simplified standard list.
  const blind: Record<string, number[]> = { Sun: [12], Moon: [6], Mars: [7], Mercury: [7], Jupiter: [12], Venus: [6], Saturn: [12] };
  const blindPlanets = chart.planets.filter((p) => (blind[p.name] ?? []).includes(p.house)).map((p) => p.name);
  // 35-year Lal Kitab dasha: starts with the planet in the Moon's house, 5 years each in order Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn.
  const moon = planetByName(chart, 'Moon');
  const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const startPlanet = chart.planets.find((p) => p.house === moon.house && order.includes(p.name))?.name ?? 'Sun';
  const startIdx = order.indexOf(startPlanet);
  const dasha35: { planet: string; startAge: number; endAge: number }[] = [];
  for (let i = 0; i < 7; i++) dasha35.push({ planet: order[(startIdx + i) % 7], startAge: i * 5, endAge: (i + 1) * 5 });
  return { rows, blindPlanets, dasha35 };
}
