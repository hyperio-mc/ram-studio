import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-ward-${Date.now()}`,
  app_name:     'WARD',
  tagline:      'Incident intelligence for dev teams',
  archetype:    'devops-monitoring',
  design_url:   'https://ram.zenbin.org/ward',
  mock_url:     'https://ram.zenbin.org/ward-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark incident intelligence mobile app for SRE/dev teams. Zinc color scale elevation, color-coded status system.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: WARD indexed ✓');
