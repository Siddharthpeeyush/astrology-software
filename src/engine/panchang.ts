// Panchang from Sun/Moon longitudes (tropical for Sun/Moon positions,
// sidereal for nakshatra — the Vedic convention).
import { KARANAS, TITHIS, YOGAS, norm360, signOf } from './constants';
import { sidereal } from './ayanamsa';
import { moonIllumination, sunriseSunset, tropicalLongitude } from './astronomy';

export interface Panchang { date: Date; tithi: string; tithiNo: number; paksha: string; nakshatra: string; yoga: string; karana: string; sunrise: string | null; sunset: string | null; moonSign: string; moonIllumPct: number }
export function panchangFor(date: Date, lat: number, lon: number): Panchang {
  const sun = tropicalLongitude('Sun', date);
  const moon = tropicalLongitude('Moon', date);
  const elong = norm360(moon - sun);
  const tithiNo = Math.floor(elong / 12) + 1;
  const paksha = elong < 180 ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithi = TITHIS[tithiNo - 1];
  const moonSid = sidereal(moon, date);
  const nakIdx = Math.floor(moonSid / (360 / 27));
  const nakshatra = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'][nakIdx];
  const yogaIdx = Math.floor(norm360(sidereal(sun, date) + moonSid) / (360 / 27));
  const yoga = YOGAS[yogaIdx];
  const karanaIdx = Math.floor(elong / 6) % 11;
  const karana = KARANAS[karanaIdx];
  const { sunrise, sunset } = sunriseSunset(date, lat, lon);
  const fmt = (d: Date | null) => (d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null);
  return { date, tithi, tithiNo, paksha, nakshatra, yoga, karana, sunrise: fmt(sunrise), sunset: fmt(sunset), moonSign: signOf(moonSid), moonIllumPct: Math.round(moonIllumination(date) * 100) };
}
export function isPanchaka(date: Date): boolean {
  // Panchaka: Moon in Aquarius/Pisces last 5 days of lunar month — simplified
  // rule used here: Moon sidereal sign Aquarius or Pisces AND tithi in last 5.
  const moonSid = sidereal(tropicalLongitude('Moon', date), date);
  const sign = Math.floor(moonSid / 30);
  const elong = norm360(tropicalLongitude('Moon', date) - tropicalLongitude('Sun', date));
  const tithiNo = Math.floor(elong / 12) + 1;
  return (sign === 10 || sign === 11) && tithiNo >= 26;
}
