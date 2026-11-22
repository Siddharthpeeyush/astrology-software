// Shared constants for the Vedic + Western engine.
export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
export const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
export const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const GRAHAS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'] as const;
export type Graha = (typeof GRAHAS)[number];
export const DASHA_YEARS: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
export const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const YOGINI_YEARS: Record<string, number> = { Mangala: 1, Pingala: 2, Dhanya: 3, Bhramari: 4, Bhadrika: 5, Ulka: 6, Siddha: 7, Sankata: 8 };
export const YOGINI_ORDER = ['Mangala','Pingala','Dhanya','Bhramari','Bhadrika','Ulka','Siddha','Sankata'];
export const TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
export const YOGAS = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
export const KARANAS = ['Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna'];
export const PLANET_EXALT = { Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200 } as Record<string, number>;
export const PLANET_DEBIL = { Sun: 190, Moon: 213, Mars: 118, Mercury: 345, Jupiter: 275, Venus: 177, Saturn: 20 } as Record<string, number>;
export const norm360 = (d: number) => ((d % 360) + 360) % 360;
export const signOf = (lon: number) => SIGNS[Math.floor(norm360(lon) / 30)];
export const signIndex = (lon: number) => Math.floor(norm360(lon) / 30);
export const degInSign = (lon: number) => norm360(lon) % 30;
export const fmtDeg = (lon: number) => {
  const l = norm360(lon);
  const d = Math.floor(l % 30);
  const m = Math.floor(((l % 30) - d) * 60);
  return `${signOf(l)} ${d}°${String(m).padStart(2, '0')}'`;
};
export const houseOf = (lon: number, cusps: number[]) => {
  const l = norm360(lon);
  for (let h = 0; h < 12; h++) {
    const a = cusps[h];
    const b = cusps[(h + 1) % 12];
    if (a <= b) { if (l >= a && l < b) return h + 1; }
    else { if (l >= a || l < b) return h + 1; }
  }
  return 1;
};
export interface BirthInput {
  name: string;
  date: string; // YYYY-MM-DD (local date at birth place)
  time: string; // HH:MM (local time at birth place)
  place: string;
  latitude: number;
  longitude: number;
  tzOffset: number; // hours east of UTC, e.g. 5.5 for IST
}
export const utcDateOf = (b: BirthInput): Date => {
  const [y, m, d] = b.date.split('-').map(Number);
  const [hh, mm] = b.time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - b.tzOffset * 3600_000);
};
export const PRESET_PLACES = [
  { place: 'Delhi', latitude: 28.61, longitude: 77.21, tzOffset: 5.5 },
  { place: 'Mumbai', latitude: 19.08, longitude: 72.88, tzOffset: 5.5 },
  { place: 'Kolkata', latitude: 22.57, longitude: 88.36, tzOffset: 5.5 },
  { place: 'Chennai', latitude: 13.08, longitude: 80.27, tzOffset: 5.5 },
  { place: 'Bengaluru', latitude: 12.97, longitude: 77.59, tzOffset: 5.5 },
  { place: 'London', latitude: 51.51, longitude: -0.13, tzOffset: 0 },
  { place: 'New York', latitude: 40.71, longitude: -74.01, tzOffset: -5 },
];
