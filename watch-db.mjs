import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-watch-${Date.now()}`,
  status:       'done',
  app_name:     'WATCH',
  tagline:      'Your stack, always on.',
  archetype:    'dev-monitoring',
  design_url:   'https://ram.zenbin.org/watch',
  mock_url:     'https://ram.zenbin.org/watch-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark infrastructure monitoring dashboard. 5 screens: Dashboard, Services, Incidents, Alerts, On-Call. Near-pure black with neon mint accent. Monospace data density.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
