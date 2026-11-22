# Astrology Software — Vedic + Western

A full-fledged astrology web app: React 19 + Vite + TypeScript, plain CSS,
Netlify Functions for the calculation API, Vitest unit tests. Free, no
sign-in, no ads, no API keys.

Design: Sample 02 Project Cosmos + Sample 03 dark-cosmic touches —
dark-crimson, Cormorant Garamond headers + Inter body, Panchang home +
6-grid, subtle starfield, moon-phase + transit strip.

## Architecture

```
src/
  main.tsx            entry (registers the PWA service worker in production)
  App.tsx             shell: birth form, tabs, Home / Kundli / Dasha /
                      Panchang / Milan / Predictions
  components/
    ChartViews.tsx    North Indian diamond chart + Western wheel (SVG)
    Sections.tsx      2027 / 100-Year / Numerology / Advanced / Western / Prashna
    Chat.tsx          rule-based astrologer chat (reads the current chart)
    Extras.tsx        Tarot, Palmistry (guided), Vastu checker
  engine/             pure TypeScript calculation engine (no UI in here)
    astronomy.ts      Astronomy Engine wrapper (see accuracy note below)
    ayanamsa.ts       Lahiri ayanamsa
    houses.ts         Placidus houses (iterative semi-arc solver)
    chart.ts          tropical + sidereal positions, Lagna, dignity
    dasha.ts          Vimshottari (120y) + Yogini (36y) + Antardasha
    panchang.ts       tithi / nakshatra / yoga / karana / sunrise / sunset
    milan.ts          Ashtakoot Milan (36 points)
    western.ts        Western aspects + Sun/Moon/Rising
    predictions.ts    Daily–Yearly + Career/Love/Health/Money from Dasha + transits
    divisional.ts     16 Varga charts (D1..D60)
    kp.ts             KP cusps, star/sub/sub-sub lords
    ashtakvarga.ts    BAV + SAV (classical 56 rules, total always 337)
    shadbala.ts       SIMPLIFIED Shadbala (see below)
    numerology.ts     Mulank / Bhagyank / name numbers / Lo Shu / Personal Year
    lalkitab.ts       Lal Kitab basic chart + 35-year dasha
    varshphal.ts      Solar return, Muntha, year lord
    gems.ts           Gemstones + Muhurat finder
    dosha.ts          Manglik / Kaal Sarp / Sade Sati + remedies
    timings.ts        Rahu Kaal / Choghadiya / Hora
    tarot.ts          78-card deck, Fisher-Yates shuffle, draw history
    prashna.ts        Horary chart for a question
    progressions.ts   Secondary progressions, Solar Return, Synastry
    report2027.ts     Personalized Horoscope 2027 (free, generated)
    report100.ts      100-Year Life Prediction data (year-by-year)
    pdf.ts / pdfs.ts  Real jsPDF downloads: 100-Year, Career, Marriage, Health
    saved.ts          Saved birth profiles (localStorage)
  i18n.ts             English + Hindi UI strings
  data/tarot.ts       22 Major Arcana meanings
netlify/
  functions/chart.ts  POST /api/chart — same engine, server-side; fails
                      visibly (500) if calculation fails, never fakes a chart
netlify.toml          build (npm run build, publish dist), SPA redirect
public/
  manifest.webmanifest, sw.js, icon.svg   PWA: installable, offline shell
```

## Accuracy notes (read before trusting a chart)

- **Astronomy Engine is used correctly, not naively.** Its
  `EclipticLongitude(body, date)` returns *heliocentric* longitude (and
  throws for the Sun). Geocentric longitudes — what astrology needs — come
  from `GeoVector(body, date, true)` + `Ecliptic(vector)`, and
  `SunPosition(date).elon` for the Sun. Verified: 1995-08-15 Moon is
  18.73° tropical geocentric (Pisces sidereal, Revati) vs 322.05° from the
  wrong function — a ~57° error if you use the wrong one.
- **Lahiri ayanamsa:** 23.853° at J2000 + 0.013968°/year (23.79° in 1995).
- **Placidus houses:** MC/Ascendant closed-form (verified: Delhi test
  chart MC 113.4°, Ascendant 202.3° tropical); intermediate cusps solved
  iteratively from their own semi-arcs; opposite cusps are exactly 180°
  apart by construction.
- **No Keplerian fallback.** If Astronomy Engine throws, the app shows an
  error — it never silently substitutes a drifting approximation.
- **Shadbala is simplified** (Sthana + Dig + Kala + Naisargika + Chesta;
  Drik Bala is NOT computed). The UI labels it simplified; totals are
  comparable within a chart, not against classical 1.0-rupa thresholds.
- **Ashtakvarga is before-reduction (B.R.) bindus only** — the classical
  reduction rules are not applied.
- **Varshphal** gives solar return, Muntha and year lord; Tajik aspects
  (Ithasala etc.) are not implemented. **Lal Kitab** is the basic chart +
  35-year dasha; Varshphal/Rin analysis is not claimed.
- **D27 Bhamsa** uses the simplified counting rule; **D30 Trimsamsa**
  follows the classical odd/even part tables.
- **Predictions are interpretations of calculated positions** (Moon sign,
  running Dasha, transits), not a human astrologer's reading and not
  medical/legal advice. The chat is rule-based, not an LLM.
- **Palmistry is guided only** — tap a line/mount on the diagram.
  Photo-based palm reading is NOT included, because it cannot be done
  accurately here.

## What is NOT built (left out rather than faked)

- Jaimini Char Dasha
- Lal Kitab Varshphal / Rin (debt) analysis
- Tajik aspects in Varshphal (Ithasala, etc.)
- Full classical Shadbala (Drik Bala) and Ashtakvarga after-reduction
- Photo-based palmistry
- The Netlify Function endpoint has not been verified on a live Netlify
  deploy (it builds as part of the repo; the client engine is the tested
  path). PDF downloads are real jsPDF files but were not clicked in a
  live browser in this pass.

## Run / test

```bash
npm install
npm run dev      # local dev server
npm test         # vitest — 21 tests
npm run build    # tsc -b && vite build (0 TypeScript errors)
```

## Deploy

Push the repo to GitHub (`Siddharthpeeyush/astrology-software`) and import
it in Netlify: branch `main`, build command `npm run build`, publish
directory `dist`. No build-time secrets are needed.
