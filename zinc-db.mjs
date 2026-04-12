import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-zinc-${Date.now()}`,
  app_name:     'ZINC',
  tagline:      'API health at a glance',
  archetype:    'api-monitoring',
  design_url:   'https://ram.zenbin.org/zinc',
  mock_url:     'https://ram.zenbin.org/zinc-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'One-color-max dark mode API monitoring tool: single amber accent, operational dark mode, dot-grid texture, terminal-style log stream',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: ZINC indexed ✓');
