import { useState } from 'react';
import { drawSpread, loadTarotHistory, saveTarotDraw, type TarotHistoryEntry } from '../engine/tarot';

// ---------- Tarot ----------
export function TarotSection() {
  const [draw, setDraw] = useState<TarotHistoryEntry | null>(null);
  const [history, setHistory] = useState<TarotHistoryEntry[]>(loadTarotHistory());
  const [question, setQuestion] = useState('');
  const doDraw = (kind: 'three' | 'celtic') => {
    const cards = drawSpread(kind);
    const entry: TarotHistoryEntry = { id: String(Date.now()), kind, question: question || '(no question)', at: new Date().toLocaleString('en-IN'), cards };
    setDraw(entry); setHistory(saveTarotDraw(entry));
  };
  return (
    <div>
      <p className="muted">A tarot draw — not astrology. The deck is shuffled for real (Fisher-Yates), no card repeats in a spread.</p>
      <div className="flex"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Your question (optional)" /><button className="primary" onClick={() => doDraw('three')}>3-Card Draw</button><button className="ghost" onClick={() => doDraw('celtic')}>Celtic Cross (10)</button></div>
      {draw && <div className="card">{draw.cards.map((c, i) => <p key={i}><b>{c.position}:</b> {c.card.name}{c.reversed ? ' (Reversed)' : ''} — {c.reversed ? c.card.reversed : c.card.upright}</p>)}</div>}
      {history.length > 0 && <details><summary>Draw history ({history.length})</summary>{history.map((h) => <p key={h.id} className="muted">{h.at} — {h.kind === 'three' ? '3-card' : 'Celtic Cross'} — {h.question} — {h.cards.map((c) => c.card.name).join(', ')}</p>)}</details>}
    </div>
  );
}

// ---------- Palmistry (guided only — NO photo reading) ----------
const PALM_INFO: Record<string, string> = {
  'Life Line': 'Life Line — curves around the thumb: vitality, major life changes, energy. A deep, clear line suggests steady vitality; breaks suggest major changes.',
  'Head Line': 'Head Line — across the middle of the palm: thinking style, focus, decision-making. Long and straight suggests logical thinking; curved suggests imagination.',
  'Heart Line': 'Heart Line — under the fingers: emotions, relationships, how you love. A long line suggests open expression; a short one, a more private nature.',
  'Fate Line': 'Fate Line — runs up the centre: career path and life direction. Not everyone has a clear one; its absence does not mean no career.',
  'Mount of Venus': 'Mount of Venus (thumb base): love, warmth, vitality and passion.',
  'Mount of Jupiter': 'Mount of Jupiter (under index finger): ambition, leadership, confidence.',
  'Mount of Saturn': 'Mount of Saturn (under middle finger): discipline, responsibility, seriousness.',
  'Mount of Apollo': 'Mount of Apollo (under ring finger): creativity, success, appreciation of beauty.',
  'Mount of Mercury': 'Mount of Mercury (under little finger): communication, business sense, quick thinking.',
  'Mount of Moon': 'Mount of Moon (outer palm, lower): imagination, intuition, travel.',
};
export function PalmistrySection() {
  const [sel, setSel] = useState('Life Line');
  return (
    <div>
      <p className="muted"><b>Guided palmistry only.</b> Photo-based palm reading is NOT included — a photo cannot be read accurately here, and I will not fake one. Tap a line or mount on the diagram to read what it traditionally means.</p>
      <div className="two">
        <svg viewBox="0 0 200 260" style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}>
          <path d="M60 250 L55 150 Q50 90 75 70 L80 40 Q82 28 92 32 L95 65 L105 30 Q108 20 116 26 L118 62 L130 35 Q134 26 141 33 L140 70 Q165 85 160 140 L155 250 Z" fill="rgba(212,162,78,.12)" stroke="#d4a24e" strokeWidth="2" />
          <path d="M70 240 Q90 180 85 130" fill="none" stroke="#f0c674" strokeWidth="2.5" onClick={() => setSel('Life Line')} style={{ cursor: 'pointer' }} />
          <path d="M60 170 Q110 150 150 130" fill="none" stroke="#f0c674" strokeWidth="2.5" onClick={() => setSel('Head Line')} style={{ cursor: 'pointer' }} />
          <path d="M62 140 Q110 120 152 105" fill="none" stroke="#f0c674" strokeWidth="2.5" onClick={() => setSel('Heart Line')} style={{ cursor: 'pointer' }} />
          <path d="M110 250 Q112 180 108 100" fill="none" stroke="#f0c674" strokeWidth="2" onClick={() => setSel('Fate Line')} style={{ cursor: 'pointer' }} />
          <circle cx="82" cy="200" r="16" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Venus')} style={{ cursor: 'pointer' }} />
          <circle cx="108" cy="78" r="11" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Jupiter')} style={{ cursor: 'pointer' }} />
          <circle cx="128" cy="72" r="11" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Saturn')} style={{ cursor: 'pointer' }} />
          <circle cx="146" cy="82" r="10" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Apollo')} style={{ cursor: 'pointer' }} />
          <circle cx="156" cy="105" r="9" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Mercury')} style={{ cursor: 'pointer' }} />
          <circle cx="142" cy="185" r="14" fill="rgba(212,162,78,.15)" stroke="#d4a24e" onClick={() => setSel('Mount of Moon')} style={{ cursor: 'pointer' }} />
        </svg>
        <div className="card"><h3>{sel}</h3><p>{PALM_INFO[sel]}</p></div>
      </div>
    </div>
  );
}

// ---------- Vastu ----------
const DIRECTIONS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
const VASTU_RULES: Record<string, Record<string, { verdict: string; note: string }>> = {
  Entrance: { 'North': { verdict: 'Excellent', note: 'North entrance brings wealth and opportunity.' }, 'North-East': { verdict: 'Excellent', note: 'Most auspicious entrance — light and clarity.' }, 'East': { verdict: 'Good', note: 'East entrance brings health and progress.' }, 'South-East': { verdict: 'Avoid', note: 'South-East entrance can bring fire-related stress and expenses.' }, 'South': { verdict: 'Avoid', note: 'South entrance is traditionally avoided for homes.' }, 'South-West': { verdict: 'Avoid', note: 'South-West entrance can bring heaviness and delays.' }, 'West': { verdict: 'Acceptable', note: 'West entrance is workable with a clear, well-lit doorway.' }, 'North-West': { verdict: 'Acceptable', note: 'North-West entrance supports social support.' } },
  Kitchen: { 'South-East': { verdict: 'Excellent', note: 'South-East (Agni) is the ideal kitchen direction.' }, 'North-West': { verdict: 'Good', note: 'North-West is the second choice for a kitchen.' }, 'North-East': { verdict: 'Avoid', note: 'Never place a kitchen in the North-East — it disturbs the sacred corner.' }, 'South-West': { verdict: 'Avoid', note: 'Kitchen in the South-West can disturb health and stability.' }, 'North': { verdict: 'Acceptable', note: 'Workable, but South-East is better.' }, 'East': { verdict: 'Acceptable', note: 'Acceptable for a kitchen.' }, 'South': { verdict: 'Acceptable', note: 'Acceptable, keep the stove in the South-East corner of the room.' }, 'West': { verdict: 'Acceptable', note: 'Workable.' } },
  Bedroom: { 'South-West': { verdict: 'Excellent', note: 'South-West is the ideal master bedroom — stability and rest.' }, 'South': { verdict: 'Good', note: 'Good for the master bedroom.' }, 'West': { verdict: 'Good', note: 'Good for children’s / guest bedroom.' }, 'North-East': { verdict: 'Avoid', note: 'Avoid a bedroom in the North-East — it is the pooja corner.' }, 'North-West': { verdict: 'Good', note: 'Good for unmarried children / guests.' }, 'North': { verdict: 'Acceptable', note: 'Acceptable.' }, 'East': { verdict: 'Acceptable', note: 'Acceptable, good morning light.' }, 'South-East': { verdict: 'Avoid', note: 'South-East bedroom can bring restlessness and arguments.' } },
  Pooja: { 'North-East': { verdict: 'Excellent', note: 'North-East (Ishan) is the ideal pooja room.' }, 'East': { verdict: 'Good', note: 'East-facing pooja is good.' }, 'North': { verdict: 'Good', note: 'North-facing pooja is good.' }, 'South': { verdict: 'Avoid', note: 'Avoid pooja in the South.' }, 'South-West': { verdict: 'Avoid', note: 'Avoid pooja in the South-West.' }, 'West': { verdict: 'Acceptable', note: 'Acceptable if North-East is not possible.' }, 'North-West': { verdict: 'Acceptable', note: 'Acceptable.' }, 'South-East': { verdict: 'Avoid', note: 'Avoid pooja in the South-East (fire corner).' } },
  Toilet: { 'North-West': { verdict: 'Good', note: 'North-West is the preferred toilet direction.' }, 'South-East': { verdict: 'Acceptable', note: 'Acceptable for toilets/bathrooms.' }, 'West': { verdict: 'Good', note: 'West is acceptable for toilets.' }, 'North-East': { verdict: 'Avoid', note: 'Never place a toilet in the North-East.' }, 'South-West': { verdict: 'Avoid', note: 'Avoid toilets in the South-West.' }, 'North': { verdict: 'Avoid', note: 'Avoid toilets in the North.' }, 'East': { verdict: 'Avoid', note: 'Avoid toilets in the East.' }, 'South': { verdict: 'Acceptable', note: 'Acceptable with care.' } },
};
export function VastuSection() {
  const [facing, setFacing] = useState('East');
  const [rooms, setRooms] = useState<Record<string, string>>({ Entrance: 'North-East', Kitchen: 'South-East', Bedroom: 'South-West', Pooja: 'North-East', Toilet: 'North-West' });
  return (
    <div>
      <p className="muted">Enter your house facing and each room’s direction — guidance is computed from those directions, not generic text.</p>
      <label>House facing direction</label>
      <select value={facing} onChange={(e) => setFacing(e.target.value)}>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</select>
      <svg viewBox="0 0 200 200" style={{ width: 200, display: 'block', margin: '12px auto' }}>
        <circle cx="100" cy="100" r="90" fill="none" stroke="#d4a24e" strokeWidth="2" />
        {DIRECTIONS.map((d, i) => { const a = ((i * 45 - 90) * Math.PI) / 180; const x = 100 + 70 * Math.cos(a); const y = 100 + 70 * Math.sin(a); return <text key={d} x={x} y={y} textAnchor="middle" fill={d === facing ? '#f0c674' : '#c9b8a8'} fontSize="11" fontWeight={d === facing ? 'bold' : 'normal'}>{d.slice(0, 2)}</text>; })}
        <text x="100" y="104" textAnchor="middle" fill="#f0c674" fontSize="13">Facing: {facing}</text>
      </svg>
      <div className="tablewrap"><table><thead><tr><th>Room</th><th>Direction</th><th>Verdict</th><th>Guidance</th></tr></thead><tbody>
        {Object.keys(VASTU_RULES).map((room) => {
          const rule = VASTU_RULES[room][rooms[room]];
          return <tr key={room}><td>{room}</td><td><select value={rooms[room]} onChange={(e) => setRooms({ ...rooms, [room]: e.target.value })}>{DIRECTIONS.map((d) => <option key={d}>{d}</option>)}</select></td><td className={rule.verdict === 'Avoid' ? 'bad' : 'good'}>{rule.verdict}</td><td>{rule.note}</td></tr>;
        })}
      </tbody></table></div>
    </div>
  );
}
