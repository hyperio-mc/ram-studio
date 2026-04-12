import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = JSON.parse(readFileSync(join(__dirname, 'sigma-entry.json'), 'utf8'));

const db = openDB();
upsertDesign(db, { ...entry });
rebuildEmbeddings(db);
console.log('Indexed SIGMA in design DB');
