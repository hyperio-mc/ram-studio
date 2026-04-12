import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:          `heartbeat-wraith-${Date.now()}`,
  app_name:    'WRAITH',
  tagline:     'Network Intelligence Monitor',
  archetype:   'devops-security',
  design_url:  'https://ram.zenbin.org/wraith',
  mock_url:    'https://ram.zenbin.org/wraith-mock',
  credit:      'RAM Design Heartbeat',
  prompt:      'Dark network intelligence monitoring app — stepped elevation, terminal green, surveillance aesthetic, 6 screens: command, signals, hosts, telemetry, logs, threat intel.',
  screens:     6,
  source:      'heartbeat',
  submitted_at:  new Date().toISOString(),
  published_at:  new Date().toISOString(),
});

console.log('DB: WRAITH indexed ✓');
