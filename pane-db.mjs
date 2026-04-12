// PANE — Design DB index
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const newEntry = JSON.parse(fs.readFileSync('/workspace/group/design-studio/pane-queue-entry.json', 'utf8'));

const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('✓ PANE indexed in design DB');
