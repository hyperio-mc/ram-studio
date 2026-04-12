import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-vellum-' + Date.now(),
  status:       'done',
  app_name:     'Vellum',
  tagline:      'Your reading life, beautifully kept',
  archetype:    'lifestyle',
  design_url:   'https://ram.zenbin.org/vellum',
  mock_url:     'https://ram.zenbin.org/vellum-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Literary reading journal inspired by Litbix (minimal.gallery). Editorial drop caps, warm parchment palette, book-spine shelf, reading heat-map calendar, Year in Books poster. Light theme.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
