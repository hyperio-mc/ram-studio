import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-mote-${Date.now()}`,
  app_name:     'MOTE',
  tagline:      'moments, distilled',
  archetype:    'micro-journaling',
  design_url:   'https://ram.zenbin.org/mote',
  mock_url:     'https://ram.zenbin.org/mote-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Micro-journaling app inspired by minimal.gallery barely-there UI and lapa.ninja bento grid. Light theme, warm cream palette, editorial serif, 6 screens.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: MOTE indexed ✓');
