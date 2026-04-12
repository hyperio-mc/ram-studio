import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-floe-${Date.now()}`,
  app_name:     'FLOE',
  tagline:      'Read Slower. Think Deeper.',
  archetype:    'reading-focus',
  design_url:   'https://ram.zenbin.org/floe',
  mock_url:     'https://ram.zenbin.org/floe-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Slow-reading companion app with editorial serif typography, warm cream palette, focus mode, highlights/notes, and curated long-read discovery. Inspired by lapa.ninja serif editorial trend.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: FLOE indexed ✓');
