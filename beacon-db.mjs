import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-beacon-${Date.now()}`,
  status: 'done',
  app_name: 'BEACON',
  tagline: 'Your Signal, Live',
  archetype: 'creator-analytics',
  design_url: 'https://ram.zenbin.org/beacon',
  mock_url: 'https://ram.zenbin.org/beacon-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Real-time creative metrics dashboard for indie makers — dark neon mint UI, signal feed, audience breakdown, milestones, AI anomaly alerts',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
