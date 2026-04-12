import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-marrow-${Date.now()}`,
  app_name: 'MARROW',
  tagline: 'nourish from within',
  archetype: 'wellness-nutrition',
  design_url: 'https://ram.zenbin.org/marrow',
  mock_url: 'https://ram.zenbin.org/marrow-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Editorial-minimal nutrition tracker inspired by minimal.gallery counter-movement (Function Health, Studio Yoke). Warm cream palette, oversized display type, single forest-green accent, no bento grid. Light theme.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: MARROW indexed ✓');
