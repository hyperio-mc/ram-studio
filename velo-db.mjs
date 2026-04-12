import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-velo-${Date.now()}`,
  app_name: 'VELO',
  tagline: 'Your ride. Perfected.',
  archetype: 'fitness-cycling',
  design_url: 'https://ram.zenbin.org/velo',
  mock_url: 'https://ram.zenbin.org/velo-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Premium cycling training companion — editorial light theme inspired by minimal.gallery "Paper" restraint and Saaspo component-grid collage trend. Warm paper palette, forest green accent, serif/sans typographic hierarchy, 6 screens.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: VELO indexed ✓');
