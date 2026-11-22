// Real multi-page PDF generation with jsPDF. The file actually contains
// the generated report — name, birth details, Lagna/Moon, Dasha timeline,
// year-by-year lines — not a placeholder.
import { jsPDF } from 'jspdf';
import type { Chart } from './chart';
import { planetByName } from './chart';
import { vimshottariDasha, antardashas, fmtDate } from './dasha';
import { yearLines, lifeStages, decadeSummaries } from './report100';
import { report2027 } from './report2027';

function addWrapped(doc: jsPDF, text: string, x: number, y: number, maxW: number, lh = 6): number {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * lh;
}
export function download100YearPDF(chart: Chart): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 170; let y = 20;
  const moon = planetByName(chart, 'Moon');
  const newPage = () => { doc.addPage(); y = 20; };
  const heading = (t: string) => { if (y > 260) newPage(); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); y = addWrapped(doc, t, 20, y, W, 7); doc.setFont('helvetica', 'normal'); doc.setFontSize(11); y += 2; };
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  y = addWrapped(doc, '100-Year Life Prediction', 20, y, W, 9);
  doc.setFontSize(12);
  y = addWrapped(doc, `${chart.input.name || 'Native'} — ${chart.input.date} ${chart.input.time}, ${chart.input.place}`, 20, y, W);
  y = addWrapped(doc, `Lagna: ${chart.lagnaSign} | Moon: ${moon.sign} ${moon.nakshatra} Pada ${moon.pada} | Generated ${new Date().toLocaleDateString('en-IN')}`, 20, y, W);
  y += 6;
  heading('Vimshottari Dasha Timeline (120-year cycle)');
  for (const d of vimshottariDasha(chart)) {
    if (y > 270) newPage();
    y = addWrapped(doc, `${d.lord} Mahadasha: ${fmtDate(d.start)} — ${fmtDate(d.end)}`, 20, y, W, 6);
    void antardashas;
  }
  heading('Life Stages');
  for (const s of lifeStages(chart)) { if (y > 260) newPage(); y = addWrapped(doc, `${s.stage} (${s.years}): ${s.summary} Basis: ${s.basis}`, 20, y, W); }
  heading('Decade Summaries — Jupiter / Saturn cycles');
  for (const d of decadeSummaries(chart)) { if (y > 260) newPage(); y = addWrapped(doc, `${d.decade}: Jupiter in ${d.jupiterSigns}; Saturn in ${d.saturnSigns}. Dasha changes: ${d.dashaChanges}.`, 20, y, W); }
  heading('Year by Year — Birth to +100 Years');
  for (const line of yearLines(chart)) { if (y > 272) newPage(); y = addWrapped(doc, line.text, 20, y, W, 6); }
  const r27 = report2027(chart);
  heading('Horoscope 2027 — Summary');
  for (const s of r27.sections) { if (y > 260) newPage(); y = addWrapped(doc, `${s.title}: ${s.text} Basis: ${s.basis}`, 20, y, W); }
  doc.save(`100-year-prediction-${(chart.input.name || 'native').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
