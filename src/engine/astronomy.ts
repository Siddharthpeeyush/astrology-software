// Astronomy Engine wrapper.
// IMPORTANT accuracy note, found by testing: Astronomy Engine's
// `EclipticLongitude(body, date)` returns HELIOCENTRIC longitude for
// planets (and throws for the Sun). Geocentric longitudes — the ones
// astrology needs — come from `GeoVector(body, date, true)` converted
// with `Ecliptic(vector)`. For the Sun, `SunPosition(date).elon` is
// geocentric. Verified 1995-08-15: Moon geocentric 18.73 deg tropical
// (Pisces sidereal, Revati) vs 322.05 deg from EclipticLongitude — the
// wrong function is off by ~57 deg. This module never uses it.
import * as Astronomy from 'astronomy-engine';
import { norm360 } from './constants';

export function tropicalLongitude(body: string, date: Date): number {
  if (body === 'Sun') return norm360(Astronomy.SunPosition(date).elon);
  const vec = Astronomy.GeoVector((Astronomy.Body as unknown as Record<string, unknown>)[body] as never, date, true);
  return norm360(Astronomy.Ecliptic(vec).elon);
}
export function tropicalLongitudeAt(body: string, ms: number): number {
  return tropicalLongitude(body, new Date(ms));
}
export function siderealTimeHours(date: Date): number {
  return Astronomy.SiderealTime(date);
}
export function moonPhaseAngle(date: Date): number {
  return Astronomy.MoonPhase(date);
}
export function moonIllumination(date: Date): number {
  return Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction;
}
/** Mean lunar node (Rahu) longitude, tropical, Meeus formula. Ketu = Rahu + 180. */
export function meanNodeLongitude(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  return norm360(125.0445 - 0.0529538083 * d);
}
export function sunriseSunset(dateLocal: Date, lat: number, lon: number): { sunrise: Date | null; sunset: Date | null } {
  const observer = new Astronomy.Observer(lat, lon, 0);
  const start = new Date(Date.UTC(dateLocal.getUTCFullYear(), dateLocal.getUTCMonth(), dateLocal.getUTCDate(), 0, 0, 0));
  try {
    const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, start, 1);
    const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, start, 1);
    return { sunrise: rise ? rise.date : null, sunset: set ? set.date : null };
  } catch {
    return { sunrise: null, sunset: null };
  }
}
