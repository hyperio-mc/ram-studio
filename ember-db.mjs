// ember-db.mjs — Index EMBER Podcast AI in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const newEntry = JSON.parse(fs.readFileSync('/workspace/group/design-studio/ember-queue-entry.json', 'utf8'));

const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('✓ EMBER indexed in design DB');
