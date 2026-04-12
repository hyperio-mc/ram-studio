import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
const entry = JSON.parse(require('fs').readFileSync('./prism-entry.json', 'utf8'));
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB');
