import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-depot-' + Date.now(),
  status:       'done',
  app_name:     'DEPOT',
  tagline:      'Motion assets, shipped fresh',
  archetype:    'creative-asset-marketplace',
  design_url:   'https://ram.zenbin.org/depot',
  mock_url:     'https://ram.zenbin.org/depot-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark retail-catalog UX for a digital motion asset marketplace. Inspired by 108.supply (godly.website).',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
