import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-spine-${Date.now()}`,
  app_name:     'SPINE',
  tagline:      'your reading life, beautifully tracked',
  archetype:    'reading-tracker',
  design_url:   'https://ram.zenbin.org/spine',
  mock_url:     'https://ram.zenbin.org/spine-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Design a reading life tracker app inspired by minimal.gallery editorial serif revival, lapa.ninja warm parchment backgrounds, and saaspo bento-grid feature cards. Light theme.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: SPINE indexed ✓');
