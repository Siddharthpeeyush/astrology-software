// Daily timings from sunrise/sunset + weekday: Rahu Kaal, Choghadiya, Hora.
// Rahu Kaal segments (1.5h each, 8 segments from sunrise to sunset):
// Mon 2nd segment, Tue 7th, Wed 5th, Thu 6th, Fri 4th, Sat 3rd, Sun 8th.
// (Day segment numbering: 1st segment starts at sunrise.)
// Choghadiya (day): weekday-specific order of 8 lords, each 1/8 of the day.
// Hora: planetary hours — day starts with the weekday lord, then follows
// the Chaldean order Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.
import { sunriseSunset } from './astronomy';
export interface TimeSlot { name: string; start: Date; end: Date; good: boolean }
const DAY_LORDS: Record<number, string> = { 0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury', 4: 'Jupiter', 5: 'Venus', 6: 'Saturn' };
const CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const RAHU_SEGMENT: Record<number, number> = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 }; // Sun=0..Sat=6
const CHOGHADIYA_DAY: Record<number, string[]> = {
  0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit'],
  2: ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh'],
  4: ['Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  5: ['Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal'],
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal'],
};
const CHOGHADIYA_GOOD: Record<string, boolean> = { Amrit: true, Shubh: true, Labh: true, Chal: true, Udveg: false, Rog: false, Kaal: false };
const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export function dayTimings(date: Date, lat: number, lon: number): { sunrise: string | null; sunset: string | null; rahuKaal: TimeSlot | null; choghadiya: TimeSlot[]; horas: TimeSlot[] } {
  const { sunrise, sunset } = sunriseSunset(date, lat, lon);
  if (!sunrise || !sunset) return { sunrise: null, sunset: null, rahuKaal: null, choghadiya: [], horas: [] };
  const dayLen = sunset.getTime() - sunrise.getTime();
  const seg = dayLen / 8;
  const weekday = date.getDay();
  const rahuIdx = RAHU_SEGMENT[weekday] - 1;
  const rahuKaal: TimeSlot = { name: 'Rahu Kaal', start: new Date(sunrise.getTime() + rahuIdx * seg), end: new Date(sunrise.getTime() + (rahuIdx + 1) * seg), good: false };
  const choghadiya = CHOGHADIYA_DAY[weekday].map((name, i) => ({ name, start: new Date(sunrise.getTime() + i * seg), end: new Date(sunrise.getTime() + (i + 1) * seg), good: CHOGHADIYA_GOOD[name] }));
  // Horas: start with weekday lord, then Chaldean order cyclically.
  const startLord = DAY_LORDS[weekday];
  let idx = CHALDEAN.indexOf(startLord);
  const horas = Array.from({ length: 8 }, (_, i) => {
    const lord = CHALDEAN[(idx + i) % 7];
    return { name: `${lord} Hora`, start: new Date(sunrise.getTime() + i * seg), end: new Date(sunrise.getTime() + (i + 1) * seg), good: ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(lord) };
  });
  return { sunrise: fmt(sunrise), sunset: fmt(sunset), rahuKaal, choghadiya, horas };
}
export const fmtTime = fmt;
