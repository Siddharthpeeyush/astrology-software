import { useMemo, useState } from 'react';
import { computeChart, fmtPlanet, type Chart } from './engine/chart';
import { PRESET_PLACES, type BirthInput } from './engine/constants';
import { vimshottariDasha, antardashas, dashaAt, yoginiDasha, fmtDate } from './engine/dasha';
import { panchangFor } from './engine/panchang';
import { ashtakoot } from './engine/milan';
import { predictionsFor, dailyText } from './engine/predictions';
import { dayTimings } from './engine/timings';
import { loadSaved, saveProfile, deleteProfile } from './engine/saved';
import { NorthIndianChart } from './components/ChartViews';
import { t, type Lang } from './i18n';
import { Sections } from './components/Sections';
import { ChatBox } from './components/Chat';
import { TarotSection, PalmistrySection, VastuSection } from './components/Extras';

const SAMPLE: BirthInput = { name: 'Sample Native', date: '1995-08-15', time: '10:30', place: 'Delhi', latitude: 28.61, longitude: 77.21, tzOffset: 5.5 };
const TABS = ['home', 'kundli', 'dasha', 'panchang', 'milan', 'predictions', '2027', '100year', 'numerology', 'advanced', 'western', 'chat', 'tarot', 'palmistry', 'vastu', 'prashna'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [input, setInput] = useState<BirthInput>(SAMPLE);
  const [chart, setChart] = useState<Chart | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [saved, setSaved] = useState<BirthInput[]>(loadSaved());
  const [milan2, setMilan2] = useState<BirthInput>({ name: 'Partner', date: '1997-02-14', time: '09:15', place: 'Mumbai', latitude: 19.08, longitude: 72.88, tzOffset: 5.5 });
  const [error, setError] = useState('');
  const today = useMemo(() => panchangFor(new Date(), input.latitude, input.longitude), [input.latitude, input.longitude]);
  const timings = useMemo(() => dayTimings(new Date(), input.latitude, input.longitude), [input.latitude, input.longitude]);

  const calculate = () => {
    if (!input.date || !input.time || !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) { setError('Please enter date, time, latitude and longitude.'); return; }
    setError('');
    try { setChart(computeChart(input)); } catch (e) { setError(`Calculation failed: ${e instanceof Error ? e.message : String(e)}`); }
  };
  const set = (keyOrPatch: keyof BirthInput | Partial<BirthInput>, value?: string | number) =>
    setInput((p) => (typeof keyOrPatch === 'string' ? { ...p, [keyOrPatch]: value } : { ...p, ...keyOrPatch }));
  const applyPreset = (place: string) => { const p = PRESET_PLACES.find((x) => x.place === place); if (p) set(p); };

  return (
    <div className="wrap">
      <header className="hero"><div className="stars" />
        <h1>{t(lang, 'appTitle')}</h1>
        <p>{t(lang, 'tagline')}</p>
        <div className="flex" style={{ justifyContent: 'center', marginTop: 10 }}>
          <button className={lang === 'en' ? 'primary' : 'ghost'} onClick={() => setLang('en')}>English</button>
          <button className={lang === 'hi' ? 'primary' : 'ghost'} onClick={() => setLang('hi')}>हिन्दी</button>
          <span className="pill">{t(lang, 'freeInstant')}</span>
        </div>
      </header>

      <section className="card">
        <h2>{t(lang, 'birthDetails')}</h2>
        <div className="two">
          <div><label>Name</label><input value={input.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div><label>Place</label><div className="flex"><input value={input.place} onChange={(e) => set('place', e.target.value)} /><select value={input.place} onChange={(e) => applyPreset(e.target.value)}>{PRESET_PLACES.map((p) => <option key={p.place}>{p.place}</option>)}</select></div></div>
          <div><label>Date of birth</label><input type="date" value={input.date} onChange={(e) => set('date', e.target.value)} /></div>
          <div><label>Time of birth</label><input type="time" value={input.time} onChange={(e) => set('time', e.target.value)} /></div>
          <div><label>Latitude</label><input type="number" step="0.01" value={input.latitude} onChange={(e) => set('latitude', Number(e.target.value))} /></div>
          <div><label>Longitude</label><input type="number" step="0.01" value={input.longitude} onChange={(e) => set('longitude', Number(e.target.value))} /></div>
          <div><label>Timezone (hours east of UTC, IST = 5.5)</label><input type="number" step="0.5" value={input.tzOffset} onChange={(e) => set('tzOffset', Number(e.target.value))} /></div>
        </div>
        {error && <p className="bad">{error}</p>}
        <div className="flex" style={{ marginTop: 12 }}>
          <button className="primary" onClick={calculate}>{t(lang, 'calculate')}</button>
          <button className="ghost" onClick={() => { setSaved(saveProfile(input)); }}>💾 {t(lang, 'saveChart')}</button>
        </div>
        <p className="muted">{t(lang, 'sampleNote')}</p>
        {saved.length > 0 && <div><h3>{t(lang, 'savedCharts')}</h3>{saved.map((s) => <div key={s.name + s.date} className="flex"><span>{s.name} — {s.date} {s.time}, {s.place}</span><button className="ghost" onClick={() => { setInput(s); setChart(computeChart(s)); }}>Load</button><button className="ghost" onClick={() => setSaved(deleteProfile(s.name, s.date))}>Delete</button></div>)}</div>}
      </section>

      <div className="grid6">
        {([['kundli', t(lang, 'kundli'), 'Lagna, planets, D1 + D9'], ['dasha', t(lang, 'dasha'), 'Vimshottari + Yogini'], ['panchang', t(lang, 'panchang'), 'Tithi, Rahu Kaal, Hora'], ['milan', t(lang, 'matching'), 'Ashtakoot / 36'], ['predictions', t(lang, 'predictions'), 'Daily–Yearly + areas'], ['2027', t(lang, 'horoscope2027'), 'Free instant report']] as [Tab, string, string][]).map(([k, label, sub]) => (
          <button key={k} className="tile" onClick={() => { if (!chart) calculate(); setTab(k); }}><b>{label}</b><span>{sub}</span></button>
        ))}
      </div>

      <nav className="tabs">{TABS.map((k) => <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{k === 'home' ? 'Home' : k === '100year' ? t(lang, 'life100') : k === 'advanced' ? t(lang, 'advanced') : k === 'western' ? t(lang, 'western') : k === 'numerology' ? t(lang, 'numerology') : k === 'chat' ? t(lang, 'chat') : k === 'tarot' ? t(lang, 'tarot') : k === 'palmistry' ? t(lang, 'palmistry') : k === 'vastu' ? t(lang, 'vastu') : k === 'prashna' ? t(lang, 'prashna') : t(lang, k as never) || k}</button>)}</nav>

      {tab === 'home' && (
        <section className="card">
          <h2>Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          <p><b>{t(lang, 'tithi')}:</b> {today.tithi} ({today.paksha}) · <b>{t(lang, 'nakshatra')}:</b> {today.nakshatra} · <b>{t(lang, 'yoga')}:</b> {today.yoga} · <b>{t(lang, 'karana')}:</b> {today.karana}</p>
          <p><b>{t(lang, 'sunrise')}:</b> {today.sunrise ?? '—'} · <b>{t(lang, 'sunset')}:</b> {today.sunset ?? '—'} · <b>Moon:</b> {today.moonSign} ({today.moonIllumPct}% lit)</p>
          {timings.rahuKaal && <p><b>Rahu Kaal:</b> {timings.rahuKaal.start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {timings.rahuKaal.end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (avoid starting new work)</p>}
          {chart ? <p>{dailyText(chart).text}<br /><span className="muted">Basis: {dailyText(chart).basis}</span></p> : <p className="muted">Calculate your chart to see your personal Today prediction here.</p>}
        </section>
      )}

      {tab === 'kundli' && chart && (
        <section className="card"><h2>{t(lang, 'kundli')} — {chart.input.name}</h2>
          <p><b>{t(lang, 'lagna')}:</b> {chart.lagnaSign} ({chart.lagnaSidereal.toFixed(1)}° sidereal) · <b>{t(lang, 'moonSign')}:</b> {chart.planets.find((p) => p.name === 'Moon')!.sign} · <b>Ayanamsa (Lahiri):</b> {chart.ayanamsa.toFixed(2)}°</p>
          <NorthIndianChart chart={chart} />
          <div className="tablewrap"><table><thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th><th>State</th></tr></thead><tbody>
            {chart.planets.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.sign}</td><td>{p.degree.toFixed(1)}°</td><td>{p.nakshatra} {p.pada}</td><td>{p.house}</td><td>{p.retrograde ? 'Retrograde' : ''} {p.dignity}</td></tr>)}
          </tbody></table></div>
          <p className="muted">{chart.planets.map(fmtPlanet).join(' · ')}</p>
        </section>
      )}

      {tab === 'dasha' && chart && (
        <section className="card"><h2>{t(lang, 'dasha')}</h2>
          <h3>Vimshottari (120-year cycle)</h3>
          <div className="tablewrap"><table><thead><tr><th>Lord</th><th>Start</th><th>End</th><th>Years</th></tr></thead><tbody>
            {vimshottariDasha(chart).map((d, i) => <tr key={i}><td>{d.lord}</td><td>{fmtDate(d.start)}</td><td>{fmtDate(d.end)}</td><td>{d.years.toFixed(1)}</td></tr>)}
          </tbody></table></div>
          <h3>Antardasha of the current Mahadasha</h3>
          <p>{(() => { const { maha } = dashaAt(chart, new Date()); return `${maha.lord} Mahadasha: ` + antardashas(chart, maha).map((a) => `${a.lord} (${fmtDate(a.start)}–${fmtDate(a.end)})`).join(', '); })()}</p>
          <h3>Yogini Dasha (36-year cycle)</h3>
          <div className="tablewrap"><table><thead><tr><th>Lord</th><th>Start</th><th>End</th></tr></thead><tbody>
            {yoginiDasha(chart).slice(0, 10).map((d, i) => <tr key={i}><td>{d.lord}</td><td>{fmtDate(d.start)}</td><td>{fmtDate(d.end)}</td></tr>)}
          </tbody></table></div>
        </section>
      )}

      {tab === 'panchang' && (
        <section className="card"><h2>{t(lang, 'panchang')}</h2>
          <p><b>{t(lang, 'tithi')}:</b> {today.tithi} · <b>{t(lang, 'nakshatra')}:</b> {today.nakshatra} · <b>{t(lang, 'yoga')}:</b> {today.yoga} · <b>{t(lang, 'karana')}:</b> {today.karana} · <b>{t(lang, 'sunrise')}:</b> {today.sunrise} · <b>{t(lang, 'sunset')}:</b> {today.sunset}</p>
          <h3>Rahu Kaal &amp; Choghadiya (today)</h3>
          {timings.rahuKaal && <p><b>Rahu Kaal:</b> {timings.rahuKaal.start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {timings.rahuKaal.end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
          <div className="tablewrap"><table><thead><tr><th>Choghadiya</th><th>Time</th><th>Good?</th></tr></thead><tbody>
            {timings.choghadiya.map((c, i) => <tr key={i}><td>{c.name}</td><td>{c.start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {c.end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td><td className={c.good ? 'good' : 'bad'}>{c.good ? 'Good' : 'Avoid'}</td></tr>)}
          </tbody></table></div>
          <h3>Hora (planetary hours)</h3>
          <div className="tablewrap"><table><thead><tr><th>Hora</th><th>Time</th><th>Good?</th></tr></thead><tbody>
            {timings.horas.map((c, i) => <tr key={i}><td>{c.name}</td><td>{c.start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {c.end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td><td className={c.good ? 'good' : 'bad'}>{c.good ? 'Good' : 'Mixed'}</td></tr>)}
          </tbody></table></div>
        </section>
      )}

      {tab === 'milan' && chart && (
        <section className="card"><h2>{t(lang, 'matching')}</h2>
          <p className="muted">Person 1 is the chart above. Enter Person 2 below.</p>
          <div className="two">
            <div><label>Person 2 — Date</label><input type="date" value={milan2.date} onChange={(e) => setMilan2({ ...milan2, date: e.target.value })} /></div>
            <div><label>Person 2 — Time</label><input type="time" value={milan2.time} onChange={(e) => setMilan2({ ...milan2, time: e.target.value })} /></div>
            <div><label>Person 2 — Latitude</label><input type="number" step="0.01" value={milan2.latitude} onChange={(e) => setMilan2({ ...milan2, latitude: Number(e.target.value) })} /></div>
            <div><label>Person 2 — Longitude</label><input type="number" step="0.01" value={milan2.longitude} onChange={(e) => setMilan2({ ...milan2, longitude: Number(e.target.value) })} /></div>
          </div>
          {(() => { const r = ashtakoot(chart, computeChart(milan2)); return <div><h3>Score: {r.total} / 36 — {r.verdict}</h3><div className="tablewrap"><table><thead><tr><th>Koota</th><th>Points</th><th>Detail</th></tr></thead><tbody>{r.kootas.map((k) => <tr key={k.name}><td>{k.name}</td><td>{k.points} / {k.max}</td><td>{k.detail}</td></tr>)}</tbody></table></div></div>; })()}
        </section>
      )}

      {tab === 'predictions' && chart && (
        <section className="card"><h2>{t(lang, 'predictions')}</h2>
          <p className="muted">Generated from your Moon sign, running Dasha and today’s transits — each card shows its basis.</p>
          {predictionsFor(chart).map((c) => <div key={c.area} className="card"><h3>{c.area}</h3><p>{c.text}</p><p className="muted">Basis: {c.basis}</p></div>)}
        </section>
      )}

      {(tab === '2027' || tab === '100year' || tab === 'numerology' || tab === 'advanced' || tab === 'western' || tab === 'prashna') && (
        <Sections tab={tab} chart={chart} lang={lang} input={input} />
      )}
      {tab === 'chat' && <section className="card"><h2>{t(lang, 'chat')}</h2><ChatBox chart={chart} /></section>}
      {tab === 'tarot' && <section className="card"><h2>{t(lang, 'tarot')}</h2><TarotSection /></section>}
      {tab === 'palmistry' && <section className="card"><h2>{t(lang, 'palmistry')}</h2><PalmistrySection /></section>}
      {tab === 'vastu' && <section className="card"><h2>{t(lang, 'vastu')}</h2><VastuSection /></section>}
      {!chart && tab !== 'home' && tab !== 'panchang' && tab !== 'chat' && tab !== 'tarot' && tab !== 'palmistry' && tab !== 'vastu' && (
        <section className="card"><p>Enter your birth details above and tap <b>{t(lang, 'calculate')}</b> first — every section is calculated from that chart.</p></section>
      )}
      <footer className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>
        Astrology Software — Vedic + Western · Astronomy Engine (geocentric) + Lahiri ayanamsa · Free, no sign-in, no ads · Installable as an app (PWA)
      </footer>
    </div>
  );
}
