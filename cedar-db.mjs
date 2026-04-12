import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-cedar-${Date.now()}`,
  app_name:     'Cedar',
  tagline:      'A place for slow reflection',
  archetype:    'slow-living-journal',
  design_url:   'https://ram.zenbin.org/cedar',
  mock_url:     'https://ram.zenbin.org/cedar-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme mindful life-logging app. Inspired by minimal.gallery Aesop editorial warmth — warm ivory, single forest-green accent, asymmetric bento daily view, single typeface (Georgia serif).',
  screens:      7,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: Cedar indexed ✓');
