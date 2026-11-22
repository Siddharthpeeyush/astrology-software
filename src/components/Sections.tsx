import { useEffect, useMemo, useState } from 'react';
import type { Chart } from '../engine/chart';
import type { BirthInput } from '../engine/constants';
import { computeChart } from '../engine/chart';
import { report2027 } from '../engine/report2027';
import { yearLines, lifeStages, decadeSummaries } from '../engine/report100';
import { download100YearPDF } from '../engine/pdf';
import { downloadCareerPDF, downloadMarriagePDF, downloadHealthPDF } from '../engine/pdfs';
import { mulank, bhagyank, nameNumber, loShu, LUCKY, personalYear, personalYearTimeline } from '../engine/numerology';
import { allDivisional } from '../engine/divisional';
import { kpCusps, kpPlanets } from '../engine/kp';
import { ashtakvarga } from '../engine/ashtakvarga';
import { shadbala } from '../engine/shadbala';
import { lalKitab } from '../engine/lalkitab';
import { varshphal } from '../engine/varshphal';
import { gemRecommendations, findMuhurat } from '../engine/gems';
import { detectDoshas, currentSadeSati } from '../engine/dosha';
import { westernAspects, westernSummary } from '../engine/western';
import { progressedChart, solarReturnChart, synastry } from '../engine/progressions';
import { prashna } from '../engine/prashna';
import { WesternWheel } from './ChartViews';
import { t, type Lang } from '../i18n';

export function Sections({ tab, chart, lang }: { tab: string; chart: Chart | null; lang: Lang; input: BirthInput }) {
  const [r27, setR27] = useState<ReturnType<typeof report2027> | null>(null);
  const [r27Stale, setR27Stale] = useState(false);
  const [q, setQ] = useState('');
  const [prashnaRes, setPrashnaRes] = useState<ReturnType<typeof prashna> | null>(null);
  const [synChart, setSynChart] = useState<Chart | null>(null);

  // If birth details change after a 2027 report was generated, flag it stale.
  useEffect(() => { if (r27) setR27Stale(true); }, [chart?.input.date, chart?.input.time, chart?.input.place]); // eslint-disable-line react-hooks/exhaustive-deps
  const numerology = useMemo(() => {
    if (!chart) return null;
    const day = Number(chart.input.date.split('-')[2]);
    return { mulank: mulank(day), bhagyank: bhagyank(chart.input.date), pyth: nameNumber(chart.input.name, 'pythagorean'), chald: nameNumber(chart.input.name, 'chaldean'), lo: loShu(chart.input.date), py2026: personalYear(chart.input.date, 2026), py2027: personalYear(chart.input.date, 2027) };
  }, [chart]);

  if (!chart) return null;

  if (tab === '2027') {
    return (
      <section className="card"><h2>{t(lang, 'horoscope2027')} — {t(lang, 'freeInstant')}</h2>
        <p className="muted">Generated from YOUR Kundli — not a generic sign horoscope. Tap Generate; if you change your birth details afterwards, the report is flagged stale until you regenerate.</p>
        <div className="flex"><button className="primary" onClick={() => { setR27(report2027(chart)); setR27Stale(false); }}>Generate My 2027 Report</button>{r27 && <button className="ghost" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => undefined); }}>Share</button>}</div>
        {r27Stale && <p className="bad">Birth details changed since this report was generated — please regenerate.</p>}
        {r27 && <div>
          <h3>When Will Your Luck Shine?</h3>{r27.yogas.map((y, i) => <p key={i}>• {y}</p>)}
          <p><b>Auspicious months in 2027:</b> {r27.auspiciousMonths.join(', ') || '—'}</p>
          {r27.sections.map((s) => <div key={s.title} className="card"><h3>{s.title}</h3><p>{s.text}</p><p className="muted">Basis: {s.basis}</p></div>)}
          <h3>Month by Month — 2027</h3>
          <div className="tablewrap"><table><thead><tr><th>Month</th><th>Sun</th><th>Moon (from natal)</th><th>What it means</th></tr></thead><tbody>
            {r27.months.map((m) => <tr key={m.month}><td>{m.month}</td><td>{m.sunSign}</td><td>{m.moonSign} ({m.moonHouseFromNatal}th)</td><td>{m.text}</td></tr>)}
          </tbody></table></div>
        </div>}
      </section>
    );
  }

  if (tab === '100year') {
    const years = yearLines(chart);
    return (
      <section className="card"><h2>{t(lang, 'life100')}</h2>
        <p className="muted">Birth year to birth + 100 years, driven by the full Vimshottari Dasha sequence plus Jupiter/Saturn transits and your Personal Year number each year.</p>
        <div className="flex">
          <button className="primary" onClick={() => download100YearPDF(chart)}>Download 100-Year PDF</button>
          <button className="ghost" onClick={() => downloadCareerPDF(chart)}>Career PDF</button>
          <button className="ghost" onClick={() => downloadMarriagePDF(chart)}>Marriage PDF</button>
          <button className="ghost" onClick={() => downloadHealthPDF(chart)}>Health PDF</button>
        </div>
        <h3>Life Stages</h3>{lifeStages(chart).map((s) => <p key={s.stage}><b>{s.stage} ({s.years}):</b> {s.summary} <span className="muted">Basis: {s.basis}</span></p>)}
        <h3>Decades</h3><div className="tablewrap"><table><thead><tr><th>Decade</th><th>Jupiter in</th><th>Saturn in</th><th>Dasha changes</th></tr></thead><tbody>
          {decadeSummaries(chart).map((d) => <tr key={d.decade}><td>{d.decade}</td><td>{d.jupiterSigns}</td><td>{d.saturnSigns}</td><td>{d.dashaChanges}</td></tr>)}
        </tbody></table></div>
        <h3>Year by Year (first 30 years shown — full 101 years in the PDF)</h3>
        <div className="tablewrap"><table><thead><tr><th>Year</th><th>Age</th><th>Mahadasha</th><th>Jupiter</th><th>Saturn</th><th>Personal Year</th></tr></thead><tbody>
          {years.slice(0, 30).map((y) => <tr key={y.year}><td>{y.year}</td><td>{y.age}</td><td>{y.maha} / {y.antar}</td><td>{y.jupiterSign}</td><td>{y.saturnSign}</td><td>{y.personalYear}</td></tr>)}
        </tbody></table></div>
      </section>
    );
  }

  if (tab === 'numerology' && numerology) {
    const luckyNum = numerology.bhagyank.value;
    const lucky = LUCKY[luckyNum] ?? LUCKY[1];
    return (
      <section className="card"><h2>{t(lang, 'numerology')}</h2>
        <p><b>Mulank (Psychic Number):</b> {numerology.mulank.value} — steps: {numerology.mulank.steps.join(' → ')}</p>
        <p><b>Bhagyank (Destiny Number):</b> {numerology.bhagyank.value} — steps: {numerology.bhagyank.steps.join(' → ')} <span className="muted">(fully reduced to a single digit; the intermediate 11, when it appears, is shown in the steps)</span></p>
        <p><b>Name Number — Pythagorean:</b> {numerology.pyth.value} ({numerology.pyth.steps.join(' → ')}) · <b>Chaldean:</b> {numerology.chald.value} ({numerology.chald.steps.join(' → ')})</p>
        <p><b>Name check:</b> Your name adds to {numerology.pyth.value} (Pythagorean). {numerology.pyth.value === numerology.bhagyank.value ? 'It matches your Bhagyank — traditionally considered harmonious.' : `It does not match your Bhagyank (${numerology.bhagyank.value}) — a name adding to ${numerology.bhagyank.value} or ${numerology.mulank.value} is traditionally considered more harmonious.`}</p>
        <h3>Lo Shu Grid</h3>
        <div className="loshu">{numerology.lo.grid.flat().map((n, i) => <div key={i}>{n ?? ''}</div>)}</div>
        <p><b>Present:</b> {numerology.lo.present.join(', ') || '—'} · <b>Missing:</b> {numerology.lo.missing.join(', ') || 'none'}</p>
        {numerology.lo.planes.map((p) => <p key={p.name}>{p.name}: {p.present}/{p.total} numbers present</p>)}
        {numerology.lo.arrows.map((a) => <p key={a}>• {a}</p>)}
        <h3>Lucky — Numerology</h3>
        <p><b>Lucky numbers:</b> {luckyNum} · <b>Days:</b> {lucky.days.join(', ')} · <b>Colours:</b> {lucky.colours.join(', ')} · <b>Gem:</b> {lucky.gem} · <b>Metal:</b> {lucky.metal}</p>
        <p className="muted">Cross-check with astrology: your Lagna is {chart.lagnaSign}. {lucky.gem.includes('Yellow Sapphire') && chart.lagnaSign === 'Sagittarius' ? 'Numerology and astrology agree here.' : 'Numerology and astrology do not always agree — both are shown as they are, not forced to match.'}</p>
        <h3>Personal Year</h3>
        <p><b>2026:</b> {numerology.py2026.value} ({numerology.py2026.steps.join(' → ')}) · <b>2027:</b> {numerology.py2027.value}</p>
        <div className="tablewrap"><table><thead><tr><th>Year</th><th>Personal Year</th></tr></thead><tbody>
          {personalYearTimeline(chart.input.date, chart.utc.getUTCFullYear(), 10).map((r) => <tr key={r.year}><td>{r.year}</td><td>{r.personalYear}</td></tr>)}
        </tbody></table></div>
      </section>
    );
  }

  if (tab === 'advanced') {
    const av = ashtakvarga(chart);
    const sb = shadbala(chart);
    const lk = lalKitab(chart);
    const vp = varshphal(chart, new Date().getUTCFullYear() + 1);
    const muhurat = findMuhurat(chart.input.latitude, chart.input.longitude);
    return (
      <section className="card"><h2>{t(lang, 'advanced')} — free, from your chart</h2>
        <h3>16 Divisional Charts (Vargas)</h3>
        <div className="tablewrap"><table><thead><tr><th>Varga</th><th>Lagna</th><th>Sun</th><th>Moon</th><th>Jupiter</th><th>Venus</th></tr></thead><tbody>
          {allDivisional(chart).map((v) => <tr key={v.varga}><td>D{v.varga}</td><td>{v.lagnaSign}</td><td>{v.planets.find((p) => p.name === 'Sun')!.sign}</td><td>{v.planets.find((p) => p.name === 'Moon')!.sign}</td><td>{v.planets.find((p) => p.name === 'Jupiter')!.sign}</td><td>{v.planets.find((p) => p.name === 'Venus')!.sign}</td></tr>)}
        </tbody></table></div>
        <h3>KP Cusps &amp; Sub-Lords</h3>
        <div className="tablewrap"><table><thead><tr><th>House</th><th>Sign</th><th>Star Lord</th><th>Sub Lord</th></tr></thead><tbody>
          {kpCusps(chart).map((k) => <tr key={k.house}><td>{k.house}</td><td>{k.sign}</td><td>{k.starLord}</td><td>{k.subLord}</td></tr>)}
        </tbody></table></div>
        <p className="muted">KP planets: {kpPlanets(chart).map((p) => `${p.name}: ${p.sign} / ${p.subLord}`).join(' · ')}</p>
        <h3>Ashtakvarga — Sarvashtakvarga (total {av.sav.reduce((a, b) => a + b, 0)} / 337)</h3>
        <div className="tablewrap"><table><thead><tr><th>Sign</th><th>SAV</th><th>Sun</th><th>Moon</th><th>Mars</th><th>Mercury</th><th>Jupiter</th><th>Venus</th><th>Saturn</th></tr></thead><tbody>
          {av.sav.map((v, i) => <tr key={i}><td>{['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][i]}</td><td>{v}</td>{Object.keys(av.bav).map((pl) => <td key={pl}>{av.bav[pl][i]}</td>)}</tr>)}
        </tbody></table></div>
        <p>Strongest sign: {av.strongestSign} · Weakest: {av.weakestSign}</p>
        <h3>Shadbala (simplified — see README; Drik Bala not computed, not faked)</h3>
        <div className="tablewrap"><table><thead><tr><th>Planet</th><th>Sthana</th><th>Dig</th><th>Kala</th><th>Naisargika</th><th>Chesta</th><th>Total</th><th>Strength</th></tr></thead><tbody>
          {sb.map((r) => <tr key={r.planet}><td>{r.planet}</td><td>{r.sthana}</td><td>{r.dig}</td><td>{r.kala}</td><td>{r.naisargika}</td><td>{r.chesta}</td><td>{r.total}</td><td>{r.strength}</td></tr>)}
        </tbody></table></div>
        <h3>Lal Kitab (basic)</h3>
        <p>Blind planets: {lk.blindPlanets.join(', ') || 'None'}</p>
        <div className="tablewrap"><table><thead><tr><th>Planet</th><th>House</th><th>Signification</th><th>Remedy</th></tr></thead><tbody>
          {lk.rows.map((r) => <tr key={r.planet}><td>{r.planet}</td><td>{r.house}</td><td>{r.signification}</td><td>{r.remedy}</td></tr>)}
        </tbody></table></div>
        <p>35-year Lal Kitab dasha: {lk.dasha35.map((d) => `${d.planet} ${d.startAge}–${d.endAge}y`).join(' · ')}</p>
        <h3>Varshphal (next year, {vp.year})</h3>
        <p>Solar return: {vp.returnDate.toLocaleDateString('en-IN')} · Muntha: {vp.munthaSign} (house {vp.munthaHouse}) · Year lord: {vp.yearLord} · Return Lagna: {vp.lagnaSign}</p>
        <h3>Gemstones</h3>
        {gemRecommendations(chart).map((g) => <p key={g.planet}><b>{g.planet}:</b> {g.stone} ({g.metal}, {g.finger}) — {g.reason}{g.caution ? ' ⚠️ Trial first — consult before wearing.' : ''}</p>)}
        <h3>Best Muhurat Days (next 30 days, top 7)</h3>
        <div className="tablewrap"><table><thead><tr><th>Date</th><th>Tithi</th><th>Nakshatra</th><th>Moon</th><th>Score</th><th>Notes</th></tr></thead><tbody>
          {muhurat.map((m) => <tr key={m.date.toISOString()}><td>{m.date.toLocaleDateString('en-IN')}</td><td>{m.tithi}</td><td>{m.nakshatra}</td><td>{m.moonSign}</td><td>{m.score}</td><td>{m.notes.join('; ')}</td></tr>)}
        </tbody></table></div>
        <h3>Doshas &amp; Remedies</h3>
        {detectDoshas(chart).map((d) => <div key={d.name}><p><b>{d.name}:</b> {d.severity} — {d.detail}</p>{d.remedies.map((r) => <p key={r}>• {r}</p>)}</div>)}
        <p>Sade Sati now: {currentSadeSati(chart).active ? currentSadeSati(chart).phase : 'Not active'} — {currentSadeSati(chart).detail}</p>
      </section>
    );
  }

  if (tab === 'western') {
    const ws = westernSummary(chart);
    const prog = progressedChart(chart, new Date().getUTCFullYear() - chart.utc.getUTCFullYear());
    const sr = solarReturnChart(chart, new Date().getUTCFullYear() + 1);
    return (
      <section className="card"><h2>{t(lang, 'western')}</h2>
        <p><b>Sun:</b> {ws.sunSign} · <b>Moon:</b> {ws.moonSign} · <b>Rising:</b> {ws.risingSign}</p>
        <WesternWheel chart={chart} />
        <h3>Major Aspects</h3>
        <div className="tablewrap"><table><thead><tr><th>Planets</th><th>Aspect</th><th>Orb</th></tr></thead><tbody>
          {westernAspects(chart).map((a, i) => <tr key={i}><td>{a.p1} – {a.p2}</td><td>{a.type}</td><td>{a.orb}°</td></tr>)}
        </tbody></table></div>
        <h3>Secondary Progressions (day-for-a-year, age {new Date().getUTCFullYear() - chart.utc.getUTCFullYear()})</h3>
        <p>Progressed Sun: {prog.sunSign} ({prog.sunLon.toFixed(1)}°) · Progressed Moon: {prog.moonSign} ({prog.moonLon.toFixed(1)}°) · Progressed date: {prog.date.toLocaleDateString('en-IN')}</p>
        <h3>Solar Return ({sr.returnDate.getUTCFullYear()})</h3>
        <p>Return: {sr.returnDate.toLocaleDateString('en-IN')} · Return Lagna: {sr.chart.lagnaSign} · Return Moon: {sr.chart.planets.find((p) => p.name === 'Moon')!.sign}</p>
        <h3>Synastry — compare with a second Western chart</h3>
        <div className="flex"><button className="primary" onClick={() => setSynChart(computeChart({ name: 'Partner', date: '1997-02-14', time: '09:15', place: 'Mumbai', latitude: 19.08, longitude: 72.88, tzOffset: 5.5 }))}>Compare with sample partner (14 Feb 1997, Mumbai)</button></div>
        {synChart && (() => { const s = synastry(chart, synChart); return <div><h4>Score: {s.score} / 100 — {s.verdict}</h4><p>{s.sunMoon}</p>{s.aspects.map((a, i) => <p key={i}>• {a.p1} {a.type} {a.p2} (orb {a.orb}°)</p>)}</div>; })()}
      </section>
    );
  }

  if (tab === 'prashna') {
    return (
      <section className="card"><h2>{t(lang, 'prashna')} — Horary</h2>
        <p className="muted">A chart for the moment a question is asked (Prashna tradition). It gives a leaning with its basis — an indication, not a guarantee.</p>
        <label>Your question</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Will I get the job?" />
        <div className="flex" style={{ marginTop: 10 }}><button className="primary" onClick={() => setPrashnaRes(prashna(q, new Date(), chart.input.latitude, chart.input.longitude, chart.input.tzOffset, chart.input.place))}>Ask Now (chart for this moment)</button></div>
        {prashnaRes && <div><h3>Answer: {prashnaRes.answer} (score {prashnaRes.score})</h3><p>Lagna: {prashnaRes.lagna} · Lagna lord: {prashnaRes.lagnaLord} · Moon: {prashnaRes.moonSign} (house {prashnaRes.moonHouse})</p>{prashnaRes.basis.map((b, i) => <p key={i}>• {b}</p>)}</div>}
      </section>
    );
  }
  return null;
}
