// vesper-db.mjs — Index VESPER in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const entry = JSON.parse(readFileSync('vesper-entry.json', 'utf8'));
const db    = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
