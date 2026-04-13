import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-rime-${Date.now()}`,
  app_name:     'RIME',
  tagline:      'Voice journaling for the reflective mind',
  archetype:    'voice-journaling',
  design_url:   'https://ram.zenbin.org/rime',
  mock_url:     'https://ram.zenbin.org/rime-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Warm-minimal light-theme voice journaling app with AI pattern detection and bento-grid insights.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: RIME indexed ✓');
