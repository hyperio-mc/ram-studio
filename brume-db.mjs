import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-brume-${Date.now()}`,
  app_name:     'BRUME',
  tagline:      'Your creative studio, at rest',
  archetype:    'studio-workspace',
  design_url:   'https://ram.zenbin.org/brume',
  mock_url:     'https://ram.zenbin.org/brume-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light warm cream editorial creative studio workspace — project management, clients, timeline, finances, and insights. Inspired by Land-book warm neutral SaaS trend + minimal.gallery pastel confidence pattern.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: BRUME indexed ✓');
