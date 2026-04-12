import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = JSON.parse(
  (await import('fs')).default.readFileSync('/workspace/group/design-studio/weave-queue-entry.json', 'utf8')
);

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
