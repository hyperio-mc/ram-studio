import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-crag-${Date.now()}`,
  app_name:     'CRAG',
  tagline:      'Every endpoint, every second',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/crag',
  mock_url:     'https://ram.zenbin.org/crag-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'API health monitor with OLED-black Carbon Dark palette, cyberpunk instrument-panel gauge, bento grid endpoints, latency charts, and incident timeline.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: CRAG indexed ✓');
