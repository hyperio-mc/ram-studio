// ZENITH — Design DB index
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const newEntry = JSON.parse(fs.readFileSync('/workspace/group/design-studio/zenith-queue-entry.json', 'utf8'));

const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('✓ ZENITH indexed in design DB');
