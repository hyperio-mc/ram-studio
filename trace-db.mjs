import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const entry = JSON.parse(readFileSync('/workspace/group/design-studio/trace-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed TRACE in design DB');
