import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-orion-${Date.now()}`,
  app_name:     'ORION',
  tagline:      'See every signal. Miss nothing.',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/orion',
  mock_url:     'https://ram.zenbin.org/orion-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Infrastructure observability & alerting dashboard. Dark theme with bento grid services board, engineering-first monospace metrics, and calibrated deep-space palette. Inspired by Saaspo bento-grid trend + DarkModeDesign daytona.io aesthetic.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: ORION indexed ✓');
