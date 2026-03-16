import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');

mkdirSync(DATA_DIR, { recursive: true });

const CSV_URL =
  "https://osmose.openstreetmap.fr/export/osm_opendata/Registre%20national%20des%20installations%20de%20production%20d'%c3%a9lectricit%c3%a9%20et%20de%20stockage-Analyser_Merge_Power_Plant_FR.byOSM.csv.bz2";

const SOURCE_MAP = {
  nuclear: 'Nucleaire',
  solar: 'Solaire',
  wind: 'Eolien',
  hydro: 'Hydraulique',
  gas: 'Gaz',
  coal: 'Charbon',
  biomass: 'Bioenergies',
  battery: 'Stockage',
};

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else if (ch === '"') {
      inQuotes = true;
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  console.log('=== Energie France — Power Plants Pipeline ===');
  console.log(`Date: ${new Date().toISOString()}`);

  const tmpBz2 = '/tmp/plants.csv.bz2';
  const tmpCsv = '/tmp/plants.csv';

  console.log('\n[1/3] Downloading bz2 CSV...');
  execSync(`curl -sL "${CSV_URL}" -o ${tmpBz2}`, { stdio: 'inherit' });

  console.log('[2/3] Decompressing...');
  execSync(`bunzip2 -f ${tmpBz2}`, { stdio: 'inherit' });

  console.log('[3/3] Parsing CSV...');
  const raw = readFileSync(tmpCsv, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV has no data rows');
  }

  const headerFields = parseCSVLine(lines[0]);
  const colIndex = {};
  for (let i = 0; i < headerFields.length; i++) {
    colIndex[headerFields[i].trim()] = i;
  }

  const lonIdx = colIndex['lon'];
  const latIdx = colIndex['lat'];
  const nameIdx = colIndex['name'];
  const sourceIdx = colIndex['plant:source'];
  const outputIdx = colIndex['plant:output:electricity'];
  const operatorIdx = colIndex['operator'];

  if (lonIdx === undefined || latIdx === undefined || sourceIdx === undefined) {
    console.error('Available columns:', headerFields);
    throw new Error('Required columns not found in CSV');
  }

  const plants = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const lon = parseFloat(fields[lonIdx]);
    const lat = parseFloat(fields[latIdx]);

    if (isNaN(lat) || isNaN(lon)) continue;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    const rawSource = (fields[sourceIdx] ?? '').trim().toLowerCase();
    // Handle multi-source: take the first known one
    const sourceParts = rawSource.split(';');
    let filiere = null;
    for (const part of sourceParts) {
      const mapped = SOURCE_MAP[part.trim()];
      if (mapped) {
        filiere = mapped;
        break;
      }
    }
    if (!filiere) continue;

    const rawOutput = (fields[outputIdx] ?? '').trim();
    // Capacity can be "X MW" or just a number
    let capacity = null;
    if (rawOutput) {
      const num = parseFloat(rawOutput.replace(/[^0-9.\-]/g, ''));
      if (!isNaN(num) && num > 0) capacity = num;
    }

    const name = (fields[nameIdx] ?? '').trim() || null;
    const operator = (fields[operatorIdx] ?? '').trim() || null;

    plants.push({
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lon * 10000) / 10000,
      name,
      filiere,
      capacity,
      operator,
    });
  }

  console.log(`\n  -> ${plants.length} plants with valid coordinates and known source`);

  // Summary by filiere
  const byFiliere = {};
  for (const p of plants) {
    byFiliere[p.filiere] = (byFiliere[p.filiere] || 0) + 1;
  }
  for (const [f, count] of Object.entries(byFiliere).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${f}: ${count}`);
  }

  writeFileSync(join(DATA_DIR, 'plants.json'), JSON.stringify(plants));
  console.log(`\nWrote plants.json (${plants.length} plants)`);
  console.log('Done!');
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
