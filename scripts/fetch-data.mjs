import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');

mkdirSync(DATA_DIR, { recursive: true });

const API_BASE = 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets';

const REALTIME_FIELDS = [
  'date_heure', 'consommation', 'nucleaire', 'eolien', 'solaire',
  'hydraulique', 'gaz', 'fioul', 'charbon', 'bioenergies',
  'pompage', 'taux_co2', 'ech_physiques',
];

const REGIONAL_FIELDS = [
  'code_insee_region', 'libelle_region', 'date_heure', 'consommation',
  'thermique', 'nucleaire', 'eolien', 'solaire', 'hydraulique',
  'bioenergies', 'pompage',
];

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function buildURL(dataset, params) {
  const url = new URL(`${API_BASE}/${dataset}/records`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchPage(dataset, params) {
  const url = buildURL(dataset, params);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${dataset}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** Paginate through records, max offset 10000 */
async function fetchAllRecords(dataset, params, maxRecords = 5000) {
  const records = [];
  let offset = 0;
  const limit = 100;

  while (offset < maxRecords && offset < 10000) {
    const data = await fetchPage(dataset, {
      ...params,
      limit: String(limit),
      offset: String(offset),
    });
    const results = data.results ?? [];
    if (results.length === 0) break;
    records.push(...results);
    offset += results.length;
    if (offset % 500 === 0 || results.length < limit) {
      console.log(`  ... ${records.length} records so far`);
    }
    if (results.length < limit) break;
  }
  return records;
}

// ── 1. Real-time data (last 7 days) ──
async function fetchRealtime() {
  console.log('\n[1/3] Fetching real-time data (last 7 days)...');
  const since = dateStr(7);

  const records = await fetchAllRecords('eco2mix-national-tr', {
    select: REALTIME_FIELDS.join(','),
    where: `date_heure >= '${since}'`,
    order_by: 'date_heure DESC',
  });

  console.log(`  -> ${records.length} records`);
  records.sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
  return records;
}

// ── 2. Yearly data (last 365 days, 1 point/day at noon) ──
// The consolidated dataset is huge — fetch in monthly chunks to stay under offset limit
async function fetchYearly() {
  console.log('\n[2/3] Fetching yearly data (last 365 days, sampled at noon)...');

  const allRecords = [];

  // Fetch month by month to avoid the 10000 offset limit
  for (let monthsAgo = 0; monthsAgo < 13; monthsAgo++) {
    const end = new Date();
    end.setMonth(end.getMonth() - monthsAgo);
    const start = new Date();
    start.setMonth(start.getMonth() - monthsAgo - 1);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    console.log(`  Fetching ${startStr} to ${endStr}...`);

    const records = await fetchAllRecords('eco2mix-national-cons-def', {
      select: REALTIME_FIELDS.join(','),
      where: `date_heure >= '${startStr}' AND date_heure < '${endStr}' AND consommation IS NOT NULL`,
      order_by: 'date_heure ASC',
    }, 10000);

    allRecords.push(...records);
  }

  console.log(`  -> ${allRecords.length} total records fetched`);

  // Sample: keep 1 record per day, closest to noon (12:00)
  const byDay = new Map();
  for (const r of allRecords) {
    const d = new Date(r.date_heure);
    const dayKey = d.toISOString().slice(0, 10);
    const hour = d.getHours();
    const distToNoon = Math.abs(hour - 12);

    if (!byDay.has(dayKey) || distToNoon < byDay.get(dayKey).dist) {
      byDay.set(dayKey, { record: r, dist: distToNoon });
    }
  }

  const sampled = [...byDay.values()]
    .map((v) => v.record)
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());

  console.log(`  -> ${sampled.length} daily samples`);
  return sampled;
}

// ── 3. Regional data (last 24h) ──
async function fetchRegional() {
  console.log('\n[3/3] Fetching regional data (last 24h)...');
  const since = dateStr(1);

  const records = await fetchAllRecords('eco2mix-regional-tr', {
    select: REGIONAL_FIELDS.join(','),
    where: `date_heure >= '${since}'`,
    order_by: 'date_heure DESC',
  }, 3000);

  console.log(`  -> ${records.length} records`);
  records.sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
  return records;
}

// ── Main ──
async function main() {
  console.log('=== Energie France — Data Pipeline ===');
  console.log(`Date: ${new Date().toISOString()}`);

  try {
    // Run realtime + regional in parallel, yearly sequentially (many requests)
    const [realtime, regional] = await Promise.all([
      fetchRealtime(),
      fetchRegional(),
    ]);
    const yearly = await fetchYearly();

    writeFileSync(join(DATA_DIR, 'realtime.json'), JSON.stringify(realtime));
    console.log(`\nWrote realtime.json (${realtime.length} records)`);

    writeFileSync(join(DATA_DIR, 'yearly.json'), JSON.stringify(yearly));
    console.log(`Wrote yearly.json (${yearly.length} records)`);

    writeFileSync(join(DATA_DIR, 'regional.json'), JSON.stringify(regional));
    console.log(`Wrote regional.json (${regional.length} records)`);

    console.log('\nDone!');
  } catch (err) {
    console.error('\nFATAL:', err.message);
    process.exit(1);
  }
}

main();
