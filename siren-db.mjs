import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-siren-${Date.now()}`,
  app_name: 'SIREN',
  tagline: 'real-time API incident intelligence',
  archetype: 'developer-infrastructure',
  design_url: 'https://ram.zenbin.org/siren',
  mock_url: 'https://ram.zenbin.org/siren-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-theme API incident intelligence platform for SREs. Inspired by Godly.website terminal monospaced aesthetic, DarkModeDesign.com elevation system, and Saaspo.com bento grid 2.0 layouts. Charcoal + neon amber palette deliberately avoiding the purple AI startup cliché.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SIREN indexed ✓');
