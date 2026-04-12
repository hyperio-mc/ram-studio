import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:          `heartbeat-liga-${Date.now()}`,
  app_name:    'LIGA',
  tagline:     'Independent type. Human-made.',
  archetype:   'type-tool',
  design_url:  'https://ram.zenbin.org/liga',
  mock_url:    'https://ram.zenbin.org/liga-mock',
  credit:      'RAM Design Heartbeat',
  prompt:      'Type discovery & licensing app for independent foundries. Inspired by KOMETA Typefaces (minimal.gallery) archival index aesthetic and editorial serif revival on siteinspire.com.',
  screens:     7,
  source:      'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: LIGA indexed ✓');
