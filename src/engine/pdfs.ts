// Separate detailed PDFs — Career, Marriage, Health — generated live
// from the chart with jsPDF, like the 100-year PDF.
import { jsPDF } from 'jspdf';
import type { Chart } from './chart';
import { planetByName } from './chart';
import { vimshottariDasha, dashaAt, fmtDate } from './dasha';
import { predictionsFor } from './predictions';
import { detectDoshas } from './dosha';

function baseDoc(chart: Chart, title: string): { doc: jsPDF; y: number } {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const moon = planetByName(chart, 'Moon');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text(title, 20, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.text(`${chart.input.name || 'Native'} — ${chart.input.date} ${chart.input.time}, ${chart.input.place}`, 20, 28);
  doc.text(`Lagna: ${chart.lagnaSign} | Moon: ${moon.sign} ${moon.nakshatra} Pada ${moon.pada}`, 20, 35);
  return { doc, y: 45 };
}
function para(doc: jsPDF, text: string, x: number, y: number, maxW = 170): number {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * 6 + 2;
}
function heading(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  const ny = para(doc, text, 20, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  return ny;
}
function save(doc: jsPDF, name: string) { doc.save(name); }

export function downloadCareerPDF(chart: Chart): void {
  const { doc } = baseDoc(chart, 'Career Report');
  let y = 45;
  const { maha, antar } = dashaAt(chart, new Date());
  y = heading(doc, 'Current Dasha', y);
  y = para(doc, `Running ${maha.lord} Mahadasha (${fmtDate(maha.start)} — ${fmtDate(maha.end)}), ${antar.lord} Antardasha.`, 20, y);
  y = heading(doc, 'Career Prediction', y);
  const card = predictionsFor(chart).find((c) => c.area === 'Career')!;
  y = para(doc, `${card.text} Basis: ${card.basis}`, 20, y);
  y = heading(doc, '10th House & Career Planets', y);
  const tenth = chart.planets.filter((p) => p.house === 10).map((p) => p.name).join(', ') || 'No planet in the 10th house';
  y = para(doc, `Planets in the 10th house: ${tenth}. Saturn: ${planetByName(chart, 'Saturn').sign} (house ${planetByName(chart, 'Saturn').house}); Jupiter: ${planetByName(chart, 'Jupiter').sign} (house ${planetByName(chart, 'Jupiter').house}).`, 20, y);
  y = heading(doc, 'Mahadasha Timeline (next 30 years)', y);
  for (const d of vimshottariDasha(chart).slice(0, 6)) { if (y > 270) { doc.addPage(); y = 20; } y = para(doc, `${d.lord}: ${fmtDate(d.start)} — ${fmtDate(d.end)}`, 20, y); }
  save(doc, `career-report-${(chart.input.name || 'native').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
export function downloadMarriagePDF(chart: Chart): void {
  const { doc } = baseDoc(chart, 'Marriage Report');
  let y = 45;
  const { maha } = dashaAt(chart, new Date());
  y = heading(doc, '7th House & Marriage', y);
  const seventh = chart.planets.filter((p) => p.house === 7).map((p) => p.name).join(', ') || 'No planet in the 7th house';
  y = para(doc, `Planets in the 7th house: ${seventh}. Venus: ${planetByName(chart, 'Venus').sign} (house ${planetByName(chart, 'Venus').house}). Running Dasha: ${maha.lord}.`, 20, y);
  y = heading(doc, 'Marriage Prediction', y);
  const card = predictionsFor(chart).find((c) => c.area.startsWith('Love'))!;
  y = para(doc, `${card.text} Basis: ${card.basis}`, 20, y);
  y = heading(doc, 'Doshas affecting marriage', y);
  for (const d of detectDoshas(chart)) { if (y > 270) { doc.addPage(); y = 20; } y = para(doc, `${d.name}: ${d.severity}. ${d.detail}`, 20, y); }
  save(doc, `marriage-report-${(chart.input.name || 'native').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
export function downloadHealthPDF(chart: Chart): void {
  const { doc } = baseDoc(chart, 'Health Report');
  let y = 45;
  y = heading(doc, 'Health Prediction', y);
  const card = predictionsFor(chart).find((c) => c.area === 'Health')!;
  y = para(doc, `${card.text} Basis: ${card.basis}`, 20, y);
  y = heading(doc, 'Health-related houses', y);
  y = para(doc, `6th house planets: ${chart.planets.filter((p) => p.house === 6).map((p) => p.name).join(', ') || 'none'}. 8th house planets: ${chart.planets.filter((p) => p.house === 8).map((p) => p.name).join(', ') || 'none'}. Moon: ${planetByName(chart, 'Moon').sign}; Saturn: ${planetByName(chart, 'Saturn').sign}.`, 20, y);
  y = heading(doc, 'Note', y);
  y = para(doc, 'This is an astrological indication, not medical advice. For any health concern, consult a qualified doctor.', 20, y);
  save(doc, `health-report-${(chart.input.name || 'native').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
