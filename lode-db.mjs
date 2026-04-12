import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-lode-${Date.now()}`,
  app_name:     'LODE',
  tagline:      'Codebase Intelligence',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/lode',
  mock_url:     'https://ram.zenbin.org/lode-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Spaceship manual aesthetic from Godly.website — technical documentation UI for codebase debt tracking, warm parchment light theme, terracotta accent, monospace throughout',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: LODE indexed ✓');
