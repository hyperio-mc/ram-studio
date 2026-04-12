import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync } from 'fs';

const entry = JSON.parse(readFileSync('/workspace/group/design-studio/ritual-queue-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed RITUAL in design DB');
