// strobe-db.mjs — index STROBE in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';

const entry = JSON.parse(fs.readFileSync('strobe-entry.json', 'utf8'));
const db = openDB();
upsertDesign(db, {
  ...entry,
  slug: 'strobe',
  theme: 'dark',
  inspiration: 'Saaspo gamified UI depth · Dark Mode Design mixed typography',
  tags: 'event,venue,analytics,dark,live,music,dashboard',
});
rebuildEmbeddings(db);
console.log('Indexed STROBE in design DB');
