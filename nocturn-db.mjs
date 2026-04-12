import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const entry = JSON.parse(fs.readFileSync('/tmp/nocturn-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB:', entry.app_name);
