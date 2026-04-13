import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-nib-' + Date.now(),
  app_name:     'NIB',
  tagline:      'Rare manuscript catalogue for serious collectors',
  archetype:    'collector-catalogue',
  design_url:   'https://ram.zenbin.org/nib',
  mock_url:     'https://ram.zenbin.org/nib-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Archival Index Aesthetic + Spaceship Manual pointer annotations: warm light-themed rare manuscript cataloguing app',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: NIB indexed ✓');
