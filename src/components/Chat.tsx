// Rule-based AI astrologer chat — answers ONLY from the user's own
// calculated chart. No LLM, no API key. If it cannot calculate an answer,
// it says so honestly. Labelled chart-based in the UI.
import { useState } from 'react';
import type { Chart } from '../engine/chart';
import { planetByName } from '../engine/chart';
import { dashaAt } from '../engine/dasha';
import { detectDoshas, currentSadeSati } from '../engine/dosha';
import { predictionsFor } from '../engine/predictions';

export function answerQuestion(chart: Chart | null, q: string): string {
  if (!chart) return 'Please calculate your chart first (enter your birth details above), then ask me about it.';
  const s = q.toLowerCase();
  const moon = planetByName(chart, 'Moon');
  const { maha, antar } = dashaAt(chart, new Date());
  const has = (...ws: string[]) => ws.some((w) => s.includes(w));
  if (has('lagna', 'ascendant', 'rising')) return `Your Lagna (Ascendant) is ${chart.lagnaSign} (sidereal ${chart.lagnaSidereal.toFixed(1)}°). The Lagna lord is ${['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'][Math.floor(chart.lagnaSidereal / 30)]}.`;
  if (has('moon')) return `Your Moon is in ${moon.sign}, ${moon.nakshatra} Pada ${moon.pada}, house ${moon.house}. Your Moon sign (Rashi) is ${moon.sign} and your birth star is ${moon.nakshatra}.`;
  if (has('dasha')) return `You are running ${maha.lord} Mahadasha (${maha.start.toLocaleDateString('en-IN')} – ${maha.end.toLocaleDateString('en-IN')}) with ${antar.lord} Antardasha (${antar.start.toLocaleDateString('en-IN')} – ${antar.end.toLocaleDateString('en-IN')}).`;
  if (has('marriage', 'marry', 'wedding', 'spouse')) { const c = predictionsFor(chart).find((x) => x.area.startsWith('Love'))!; return `Marriage: ${c.text} Basis: ${c.basis}`; }
  if (has('career', 'job', 'business', 'promotion')) { const c = predictionsFor(chart).find((x) => x.area === 'Career')!; return `Career: ${c.text} Basis: ${c.basis}`; }
  if (has('health')) { const c = predictionsFor(chart).find((x) => x.area === 'Health')!; return `Health: ${c.text} Basis: ${c.basis} (This is an astrological indication, not medical advice.)`; }
  if (has('money', 'wealth', 'finance', 'rich')) { const c = predictionsFor(chart).find((x) => x.area === 'Money')!; return `Money: ${c.text} Basis: ${c.basis}`; }
  if (has('dosha', 'manglik', 'sade sati', 'kaal sarp')) {
    const doshas = detectDoshas(chart); const sade = currentSadeSati(chart);
    return `Doshas in your chart:\n${doshas.map((d) => `• ${d.name}: ${d.severity} — ${d.detail}`).join('\n')}\nSade Sati now: ${sade.active ? sade.phase : 'Not active'} — ${sade.detail}`;
  }
  if (has('2027')) return 'Open the Horoscope 2027 section and tap Generate — it builds your full 2027 report from this same chart, month by month.';
  if (has('gemstone', 'gem', 'stone')) return 'See the Advanced → Gemstones section: it recommends stones from your Lagna lord and your weakest planet by Shadbala, with a trial caution for Saturn stones.';
  if (has('hello', 'hi', 'namaste')) return `Hello ${chart.input.name || ''}. Your Lagna is ${chart.lagnaSign} and your Moon is in ${moon.sign}. Ask me about your Dasha, marriage, career, health, money or doshas.`;
  return 'I can only answer from your calculated chart — try asking about your Lagna, Moon, Dasha, marriage, career, health, money, doshas, or 2027. I cannot predict lottery numbers, exact dates of events, or give medical/legal advice.';
}
export function ChatBox({ chart }: { chart: Chart | null }) {
  const [log, setLog] = useState<{ who: string; text: string }[]>([]);
  const [q, setQ] = useState('');
  const ask = () => {
    if (!q.trim()) return;
    const ans = answerQuestion(chart, q);
    setLog((l) => [...l, { who: 'You', text: q }, { who: 'Astrologer (chart-based)', text: ans }]);
    setQ('');
  };
  return (
    <div>
      <p className="muted">Chart-based astrologer — answers from YOUR calculated chart only. No LLM, no key. It is not a human astrologer.</p>
      <div className="chatlog">
        {log.map((m, i) => <div key={i} className="chatmsg"><b>{m.who}:</b> {m.text}</div>)}
        {!log.length && <p className="muted">Try: “What is my Dasha?” · “Will I get married?” · “Any dosha in my chart?”</p>}
      </div>
      <div className="flex"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Ask about your chart…" /><button className="primary" onClick={ask}>Ask</button></div>
    </div>
  );
}
