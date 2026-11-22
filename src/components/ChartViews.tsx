import type { Chart } from '../engine/chart';
import { SIGNS } from '../engine/constants';

const HOUSE_CENTRES: [number, number][] = [
  [200, 78], [100, 48], [48, 100], [78, 200], [48, 300], [100, 352],
  [200, 322], [300, 352], [352, 300], [322, 200], [352, 100], [300, 48],
];
export function NorthIndianChart({ chart }: { chart: Chart }) {
  const byHouse: Record<number, string[]> = {};
  chart.planets.forEach((p) => { (byHouse[p.house] ??= []).push(`${p.name.slice(0, 2)}${p.retrograde ? '(R)' : ''}`); });
  const lagnaHouse = 1;
  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }} role="img" aria-label="North Indian Kundli chart">
      <rect x="5" y="5" width="390" height="390" fill="none" stroke="#d4a24e" strokeWidth="2" />
      <path d="M5 5 L395 395 M395 5 L5 395 M200 5 L395 200 L200 395 L5 200 Z" fill="none" stroke="#d4a24e" strokeWidth="1.5" />
      {HOUSE_CENTRES.map(([x, y], i) => (
        <g key={i}>
          <text x={x} y={y - 8} textAnchor="middle" fill="#f0c674" fontSize="13" fontFamily="Cormorant Garamond, serif">{SIGNS[(Math.floor(chart.lagnaSidereal / 30) + i) % 12].slice(0, 3)}</text>
          <text x={x} y={y + 10} textAnchor="middle" fill="#f5ead9" fontSize="12">{(byHouse[i + 1] ?? []).join(' ')}</text>
          {i + 1 === lagnaHouse && <text x={x} y={y + 26} textAnchor="middle" fill="#f0c674" fontSize="11">Lagna</text>}
        </g>
      ))}
    </svg>
  );
}
export function WesternWheel({ chart }: { chart: Chart }) {
  const cx = 200, cy = 200, R = 170;
  const pt = (lon: number, r: number) => { const a = ((lon - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const; };
  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }} role="img" aria-label="Western natal wheel">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#d4a24e" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={R - 28} fill="none" stroke="#d4a24e" strokeWidth="1" />
      {SIGNS.map((s, i) => { const [x, y] = pt(i * 30 + 15, R - 14); return <text key={s} x={x} y={y} textAnchor="middle" fill="#f0c674" fontSize="11">{s.slice(0, 3)}</text>; })}
      {chart.cuspsTropical.map((c, i) => { const [x1, y1] = pt(c, R); const [x2, y2] = pt(c, R - 28); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4a24e" strokeWidth="1" />; })}
      {chart.planets.filter((p) => !['Rahu', 'Ketu'].includes(p.name)).map((p) => { const [x, y] = pt(p.tropical, R - 55); return <g key={p.name}><circle cx={x} cy={y} r="9" fill="#8e1f3c" stroke="#d4a24e" /><text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="10">{p.name.slice(0, 2)}</text></g>; })}
      <text x={cx} y={cy} textAnchor="middle" fill="#f0c674" fontSize="13" fontFamily="Cormorant Garamond, serif">Asc {SIGNS[Math.floor(chart.lagnaTropical / 30)]}</text>
    </svg>
  );
}
