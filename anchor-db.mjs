/**
 * Anchor — DB indexing
 */
import { readFileSync } from 'fs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = JSON.parse(readFileSync('/workspace/group/design-studio/anchor-queue-entry.json', 'utf8'));

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB:', entry.app_name);
