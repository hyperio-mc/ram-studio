import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const entry = JSON.parse(readFileSync('./pavo-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ PAVO indexed in design DB');
