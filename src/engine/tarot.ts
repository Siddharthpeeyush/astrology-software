// Tarot — a real draw: Fisher-Yates shuffle of the full 78-card deck,
// no repeats in a spread, random upright/reversed orientation.
// Minor Arcana meanings are composed from suit + rank (standard tarot).
import { MAJOR_ARCANA, type TarotCard } from '../data/tarot';
export interface DrawnCard { card: TarotCard; reversed: boolean; position: string }
const SUITS = [
  { suit: 'Wands', theme: 'action, passion and work' },
  { suit: 'Cups', theme: 'feelings, relationships and intuition' },
  { suit: 'Swords', theme: 'thought, conflict and decisions' },
  { suit: 'Pentacles', theme: 'money, work and the material world' },
];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
export function fullDeck(): TarotCard[] {
  const minor: TarotCard[] = [];
  for (const s of SUITS) for (const r of RANKS) {
    minor.push({ id: `minor-${s.suit}-${r}`, name: `${r} of ${s.suit}`, arcana: 'Minor', suit: s.suit, rank: r,
      upright: `${r} of ${s.suit} — ${s.theme}.`, reversed: `${r} of ${s.suit} reversed — the ${s.theme} theme is blocked or delayed.` });
  }
  return [...MAJOR_ARCANA, ...minor];
}
export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function drawSpread(kind: 'three' | 'celtic', rand: () => number = Math.random): DrawnCard[] {
  const positions = kind === 'three'
    ? ['Past', 'Present', 'Future']
    : ['Present', 'Challenge', 'Past', 'Future', 'Above (goal)', 'Below (foundation)', 'Advice', 'External influences', 'Hopes & fears', 'Outcome'];
  const deck = shuffle(fullDeck(), rand);
  return positions.map((position, i) => ({ card: deck[i], reversed: rand() < 0.5, position }));
}
export interface TarotHistoryEntry { id: string; kind: 'three' | 'celtic'; question: string; at: string; cards: DrawnCard[] }
const KEY = 'astro.tarotHistory.v1';
export function loadTarotHistory(): TarotHistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as TarotHistoryEntry[]; } catch { return []; }
}
export function saveTarotDraw(entry: TarotHistoryEntry): TarotHistoryEntry[] {
  const list = [entry, ...loadTarotHistory()].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
