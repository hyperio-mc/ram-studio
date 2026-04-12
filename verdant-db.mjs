// Index VERDANT in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const entry = JSON.parse(fs.readFileSync('/workspace/group/design-studio/verdant-entry.json', 'utf8'));

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✅ Indexed VERDANT in design DB — searchable via: node design-search.mjs "wellness garden biophilic"');
