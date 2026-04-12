import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-conclave-${Date.now()}`,
  status:       'done',
  app_name:     'Conclave',
  tagline:      'Private travel intelligence for the select few',
  archetype:    'luxury-travel-concierge',
  design_url:   'https://ram.zenbin.org/conclave',
  mock_url:     'https://ram.zenbin.org/conclave-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
