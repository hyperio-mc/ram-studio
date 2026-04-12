import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-plinth-${Date.now()}`,
  app_name:     'PLINTH',
  tagline:      'Your financial foundation',
  archetype:    'personal-finance',
  design_url:   'https://ram.zenbin.org/plinth',
  mock_url:     'https://ram.zenbin.org/plinth-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Personal finance OS with asymmetric bento grid, warm cream palette, serif display typography',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: PLINTH indexed ✓');
