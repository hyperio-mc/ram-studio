import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const entry = JSON.parse(fs.readFileSync('./nox-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Nox indexed in design DB');
