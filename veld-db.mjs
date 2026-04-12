import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-veld-${Date.now()}`,
  app_name: 'VELD',
  tagline: 'Know your footprint. Own your future.',
  archetype: 'sustainability-tracker',
  design_url: 'https://ram.zenbin.org/veld',
  mock_url: 'https://ram.zenbin.org/veld-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light theme sustainability / carbon footprint tracker. Warm cream earth palette, sage green accent, serif headlines, bento grid layout. Inspired by minimal.gallery muted pastels and land-book.com bento grids.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: VELD indexed ✓');
