import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-rift-${Date.now()}`,
  app_name: 'RIFT',
  tagline: 'Engineering health, at a glance.',
  archetype: 'developer-analytics',
  design_url: 'https://ram.zenbin.org/rift',
  mock_url: 'https://ram.zenbin.org/rift-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Engineering health & DORA metrics mobile dashboard. Land-book Fintech/Data Dark palette + Saaspo Linear Look.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: RIFT indexed ✓');
