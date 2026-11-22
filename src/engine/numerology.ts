// Numerology — Pythagorean + Chaldean, Lo Shu grid, Personal Year/Month/Day.
// Master numbers 11, 22, 33 are NOT reduced further (they are kept and
// labelled); all other numbers reduce to a single digit. Every function
// returns the working shown, e.g. "15+08+1995 = 38 -> 3+8 = 11 -> 1+1 = 2".
export const reduceFully = (n: number): { steps: string[]; result: number } => {
  const steps: string[] = [];
  let cur = n;
  while (cur > 9) {
    const digits = String(cur).split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    steps.push(`${digits.join('+')} = ${sum}`);
    cur = sum;
  }
  return { steps, result: cur };
};
export const reduceSteps = (n: number): { steps: string[]; result: number } => {
  const steps: string[] = [];
  let cur = n;
  while (cur > 9 && ![11, 22, 33].includes(cur)) {
    const digits = String(cur).split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    steps.push(`${digits.join('+')} = ${sum}`);
    cur = sum;
  }
  return { steps, result: cur };
};
export const digitSum = (s: string): number => s.replace(/\D/g, '').split('').reduce((a, c) => a + Number(c), 0);
export function mulank(day: number): { value: number; steps: string[] } {
  const { steps, result } = reduceSteps(day);
  return { value: result, steps: [`Day ${day}`, ...steps] };
}
export function bhagyank(date: string): { value: number; steps: string[]; raw: string } {
  const [y, m, d] = date.split('-').map(Number);
  const total = digitSum(`${d}${m}${y}`);
  // Bhagyank (Destiny) reduces fully to a single digit: 38 -> 11 -> 2.
  // The intermediate master 11 is shown in the steps, not kept as the result.
  const { steps, result } = reduceFully(total);
  return { value: result, steps: [`${d}+${m}+${y} digits = ${total}`, ...steps], raw: `${d}/${m}/${y}` };
}
const PYTH: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8 };
const CHALD: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };
export function nameNumber(name: string, system: 'pythagorean' | 'chaldean'): { value: number; steps: string[]; letters: { ch: string; n: number }[] } {
  const table = system === 'pythagorean' ? PYTH : CHALD;
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '').split('').map((ch) => ({ ch, n: table[ch] ?? 0 }));
  const total = letters.reduce((a, l) => a + l.n, 0);
  const { steps, result } = reduceSteps(total);
  return { value: result, steps: [`${letters.map((l) => `${l.ch}=${l.n}`).join(' + ')} = ${total}`, ...steps], letters };
}
export interface LoShu { grid: (number | null)[][]; present: number[]; missing: number[]; planes: { name: string; numbers: number[]; present: number; total: number }[]; arrows: string[] }
export function loShu(date: string): LoShu {
  const digits = date.replace(/\D/g, '').split('').map(Number).filter((n) => n >= 1 && n <= 9);
  const counts: Record<number, number> = {};
  digits.forEach((n) => { counts[n] = (counts[n] ?? 0) + 1; });
  const grid: (number | null)[][] = [[4, 9, 2], [3, 5, 7], [8, 1, 6]].map((row) => row.map((n) => (counts[n] ? n : null)));
  const present = Object.keys(counts).map(Number).sort((a, b) => a - b);
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !counts[n]);
  const planes = [
    { name: 'Mental plane', numbers: [4, 9, 2], present: [4, 9, 2].filter((n) => counts[n]).length, total: 3 },
    { name: 'Emotional plane', numbers: [3, 5, 7], present: [3, 5, 7].filter((n) => counts[n]).length, total: 3 },
    { name: 'Practical plane', numbers: [8, 1, 6], present: [8, 1, 6].filter((n) => counts[n]).length, total: 3 },
  ];
  const arrows: string[] = [];
  const lines = [[4, 9, 2], [3, 5, 7], [8, 1, 6], [4, 3, 8], [9, 5, 1], [2, 7, 6], [4, 5, 6], [2, 5, 8]];
  const lineNames = ['Mental arrow', 'Emotional arrow', 'Practical arrow', 'Physical arrow', 'Will arrow', 'Prosperity arrow', 'Planning arrow', 'Sensitivity arrow'];
  lines.forEach((line, i) => {
    const has = line.filter((n) => counts[n]).length;
    if (has === 3) arrows.push(`${lineNames[i]} of strength (all of ${line.join(', ')})`);
    else if (has === 0) arrows.push(`${lineNames[i]} of weakness (none of ${line.join(', ')})`);
  });
  return { grid, present, missing, planes, arrows };
}
export const LUCKY: Record<number, { days: string[]; colours: string[]; gem: string; metal: string }> = {
  1: { days: ['Sunday', 'Monday'], colours: ['Gold', 'Orange', 'Yellow'], gem: 'Ruby', metal: 'Gold' },
  2: { days: ['Monday'], colours: ['White', 'Silver', 'Light green'], gem: 'Pearl / Moonstone', metal: 'Silver' },
  3: { days: ['Thursday'], colours: ['Yellow', 'Orange'], gem: 'Yellow Sapphire', metal: 'Gold' },
  4: { days: ['Sunday', 'Saturday'], colours: ['Blue', 'Grey'], gem: 'Hessonite (Gomed)', metal: 'Iron' },
  5: { days: ['Wednesday'], colours: ['Green', 'Turquoise'], gem: 'Emerald', metal: 'Bronze' },
  6: { days: ['Friday'], colours: ['White', 'Pink', 'Light blue'], gem: 'Diamond / Opal', metal: 'Silver' },
  7: { days: ['Monday'], colours: ['White', 'Light yellow'], gem: "Cat's Eye", metal: 'Silver' },
  8: { days: ['Saturday'], colours: ['Black', 'Dark blue'], gem: 'Blue Sapphire', metal: 'Iron' },
  9: { days: ['Tuesday'], colours: ['Red', 'Crimson'], gem: 'Red Coral', metal: 'Copper' },
  11: { days: ['Monday', 'Sunday'], colours: ['Silver', 'White'], gem: 'Pearl / Moonstone', metal: 'Silver' },
  22: { days: ['Saturday', 'Monday'], colours: ['Gold', 'White'], gem: 'Pearl / Blue Sapphire', metal: 'Silver' },
  33: { days: ['Thursday', 'Friday'], colours: ['Gold', 'Rose'], gem: 'Yellow Sapphire', metal: 'Gold' },
};
export function personalYear(date: string, year: number): { value: number; steps: string[] } {
  const [, m, d] = date.split('-').map(Number);
  const total = digitSum(`${d}${m}${year}`);
  const { steps, result } = reduceSteps(total);
  return { value: result, steps: [`Birth day+month (${d}+${m}) + year ${year} digits = ${total}`, ...steps] };
}
export function personalMonth(date: string, year: number, month: number): { value: number } {
  return { value: reduceSteps(personalYear(date, year).value + month).result };
}
export function personalDay(date: string, year: number, month: number, day: number): { value: number } {
  return { value: reduceSteps(personalMonth(date, year, month).value + day).result };
}
export function personalYearTimeline(date: string, fromYear: number, count: number) {
  const out: { year: number; personalYear: number }[] = [];
  for (let y = fromYear; y < fromYear + count; y++) out.push({ year: y, personalYear: personalYear(date, y).value });
  return out;
}
