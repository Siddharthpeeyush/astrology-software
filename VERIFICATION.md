# Verification — recorded from actual runs (not claimed from code reading)

## Tests
- `npm test` — **21 tests passed, 0 failed** (`src/engine/__tests__/engine.test.ts`).
  Covers: ayanamsa application, nakshatra/pada, Dasha sequence (exactly
  120 years, Antardasha sums), Ashtakvarga totals, Panchang tithi,
  divisional D1/D9, KP sub-lord, Milan range, numerology reduction +
  master numbers + Lo Shu, Rahu Kaal / Choghadiya / Hora, Tarot deck
  (78 cards, no repeats, shuffle changes order), Solar Return month,
  Prashna determinism, Secondary Progressions (~1°/year).

## Build
- `npm run build` — **passes, 0 TypeScript errors** (tsc -b && vite build).
  One warning only: main chunk > 500 kB (jsPDF + Astronomy Engine) — a
  code-splitting note, not an error.

## Test chart 1 — 15 Aug 1995, 10:30, Delhi (28.61, 77.21, IST)
Recorded from the engine (vitest run):
- Lagna: **Virgo**, sidereal 178.47°, ayanamsa 23.79°
- Moon: **Pisces, Revati Pada 3** (sidereal 354.93°)
- Sun: Cancer 28.1° (H10) · Venus: Cancer 26.5° (H10) · Mars: Virgo 21.3° (H12)
  · Mercury: Leo 15.3° (H11) · Jupiter: Scorpio 12.0° (H2) · Saturn: Aquarius 29.7° (H5)
  · Rahu: Libra 6.0° (H1) · Ketu: Aries 6.0° (H7)
- Dasha: Mercury balance 1995-08-15 → 2002-01-28, Ketu → 2009-01-28,
  **Venus 2009-01-28 → 2029-01-28** (so Venus Mahadasha, Mercury Antardasha
  in mid-2027 — matches the earlier claim)
- Sarvashtakvarga total: **337** (as the classics require)
- D9 Lagna: Virgo · Weakest Shadbala (simplified): Venus

## Test chart 2 — 14 Feb 1997, 09:15, Mumbai (19.08, 72.88, IST)
Recorded from the engine (vitest run):
- Lagna: **Pisces**, sidereal 340.46°, ayanamsa 23.81°
- Moon: **Aries, Krittika Pada 1** (sidereal 29.07°)
- Sun: Aquarius 1.7° (H11) · Mars: Virgo 11.7° (H7) · Jupiter: Capricorn 11.7° (H11)
  · Venus: Capricorn 19.9° (H11) · Saturn: Pisces 11.1° (H1)
- Dasha: Sun 1997-02-14 → 2002-01-16, Moon → 2012-01-16, Mars → 2019-01-16;
  **Rahu Mahadasha / Mercury Antardasha in mid-2027** — a different
  Lagna, Moon and Dasha from chart 1, as required.
- Sarvashtakvarga total: **337**
- Ashtakoot Milan (chart 1 vs chart 2): **23 / 36**
- Solar return 2027 for chart 1: **August 2027** (near the 15 Aug birthday);
  for chart 2: **14 Feb 2027** — both correct after the earlier bug fix
  (the first implementation returned 31 Mar for chart 1; the year-scan
  fix was verified by the Solar Return test).

## Bugs found and fixed during this rebuild (not hidden)
1. Astronomy Engine `EclipticLongitude` is heliocentric — using it would
   put the Moon ~57° wrong. Fixed by using GeoVector + Ecliptic.
2. Vimshottari sequence overshot 120 years (126.5). Fixed by truncating
   the last period to exactly 120 years from birth.
3. Solar Return searched only Jan–Mar and returned 31 Mar. Fixed by
   scanning the whole year for the Sun-longitude crossing.
4. Bhagyank: the worked example (38 → 11 → 2) requires full reduction;
   Mulank/name numbers keep master numbers 11/22/33. Both behaviours
   are now in the code and tested.
5. Trimsamsa D30 odd-sign part 3 is Gemini (2), not Libra — fixed.

## Not verified in this pass
- Live-browser click-through of every tab and of the jsPDF downloads
  (the built `dist/` was produced; the engine paths behind the buttons
  are the tested ones, but no live browser session was run here).
- The Netlify Function `/api/chart` on a live Netlify deploy.
- Sunrise/sunset times against Drik Panchang (they come from Astronomy
  Engine's SearchRiseSet; only the tithi path is unit-tested).
