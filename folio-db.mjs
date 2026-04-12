import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-folio-editorial',
  status:       'done',
  app_name:     'FOLIO',
  tagline:      'Content intelligence for editorial teams',
  archetype:    'editorial-analytics',
  design_url:   'https://ram.zenbin.org/folio-editorial',
  mock_url:     'https://ram.zenbin.org/folio-editorial-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Editorial content analytics with archival catalog reference numbering, warm parchment palette, readability scoring.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
