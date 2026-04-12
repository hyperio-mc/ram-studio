// canon-db.mjs — index CANON in local design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-canon',
  status:       'done',
  app_name:     'CANON',
  tagline:      'Build your literary canon.',
  archetype:    'reading-intelligence',
  design_url:   'https://ram.zenbin.org/canon',
  mock_url:     'https://ram.zenbin.org/canon-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Light editorial reading tracker inspired by Litbix (minimal.gallery). Warm cream paper palette, EB Garamond serif, russet book-spine strip motif. 6 screens: Today, Book Detail, Library, Discover, Insights, Highlights.',
  screens:      6,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed CANON in design DB');
