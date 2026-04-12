import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-kelp-${Date.now()}`,
  app_name:     'KELP',
  tagline:      'grow quietly, one habit at a time',
  archetype:    'habit-tracker',
  design_url:   'https://ram.zenbin.org/kelp',
  mock_url:     'https://ram.zenbin.org/kelp-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Design a mindful habit tracker inspired by the bento grid layout trend (land-book.com) and the earth-tone + typographic restraint seen on minimal.gallery. Light theme with warm linen palette and single deep teal accent.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KELP indexed ✓');
