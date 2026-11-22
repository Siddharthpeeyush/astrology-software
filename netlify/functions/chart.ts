// Netlify Function: POST /api/chart { name, date, time, place, latitude, longitude, tzOffset }
// Returns the computed chart JSON using the same engine as the client
// (Astronomy Engine, geocentric longitudes + Lahiri ayanamsa).
// If the engine throws, it fails visibly with a 500 and an error message
// — it never returns a fabricated chart.
import { computeChart } from '../../src/engine/chart';
import type { BirthInput } from '../../src/engine/constants';

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  try {
    const input = JSON.parse(event.body ?? '{}') as BirthInput;
    if (!input.date || !input.time || !Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'date, time, latitude and longitude are required' }) };
    }
    const chart = computeChart(input);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(chart) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: `Calculation failed: ${e instanceof Error ? e.message : String(e)}` }) };
  }
};
