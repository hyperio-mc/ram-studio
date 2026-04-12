import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const newEntry = JSON.parse(readFileSync('/workspace/group/design-studio/solvent-queue-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
