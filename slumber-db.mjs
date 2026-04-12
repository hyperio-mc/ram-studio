import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-slumber-${Date.now()}`,
  app_name: 'SLUMBER',
  tagline: 'AI Sleep & Recovery',
  archetype: 'health-wellness',
  design_url: 'https://ram.zenbin.org/slumber',
  mock_url: 'https://ram.zenbin.org/slumber-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark AI sleep & recovery tracker — glassmorphism revival, ambient aurora backgrounds, AI health/wellness. Emerald single-accent on deep midnight palette.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SLUMBER indexed ✓');
