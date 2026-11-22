// Saved birth profiles in localStorage.
import type { BirthInput } from './constants';
const KEY = 'astro.savedCharts.v1';
export function loadSaved(): BirthInput[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as BirthInput[]; } catch { return []; }
}
export function saveProfile(b: BirthInput): BirthInput[] {
  const list = loadSaved().filter((x) => x.name !== b.name || x.date !== b.date);
  list.unshift(b);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  return list;
}
export function deleteProfile(name: string, date: string): BirthInput[] {
  const list = loadSaved().filter((x) => !(x.name === name && x.date === date));
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
