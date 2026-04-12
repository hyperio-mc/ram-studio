import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-atlas-${Date.now()}`,
  status:       'done',
  app_name:     'Atlas',
  tagline:      'Wealth, privately commanded',
  archetype:    'private-wealth-luxury-dark',
  design_url:   'https://ram.zenbin.org/atlas',
  mock_url:     'https://ram.zenbin.org/atlas-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed Atlas in design DB');
