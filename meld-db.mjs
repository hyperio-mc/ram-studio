import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-meld-${Date.now()}`,
  app_name:     'MELD',
  tagline:      'Privacy-first data pipeline monitor',
  archetype:    'developer-monitoring',
  design_url:   'https://ram.zenbin.org/meld',
  mock_url:     'https://ram.zenbin.org/meld-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark glassmorphism data pipeline monitor — ambient orb backgrounds, bento-grid dashboard, inner-glow interactions, monospace event log. Inspired by darkmodedesign.com (Qase cosmic-navy, Cosmos Studio orbs, Darkroom glows) and saaspo.com (Betterstack bento grids).',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: MELD indexed ✓');
