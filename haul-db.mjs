import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-haul-${Date.now()}`,
  app_name:     'HAUL',
  tagline:      'Freelance income & project tracker',
  archetype:    'freelance-finance',
  design_url:   'https://ram.zenbin.org/haul',
  mock_url:     'https://ram.zenbin.org/haul-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme neubrutalist freelance income tracker. Inspired by Land-book neubrutalism trend + Lapa Ninja orange-as-2026-breakout-color research. Warm cream palette, bold orange accent, thick border cards with offset shadows, heavy grotesque typography. 6 screens.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: HAUL indexed ✓');
