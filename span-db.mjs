import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-span-${Date.now()}`,
  status: 'done',
  app_name: 'SPAN',
  tagline: 'Distributed Trace & API Intelligence',
  archetype: 'developer-tools-dark',
  design_url: 'https://ram.zenbin.org/span',
  mock_url: 'https://ram.zenbin.org/span-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by darkmodedesign.com featuring Linear and Midday — deep navy #040612 + indigo+cyan dual-accent developer tool SaaS. API observability dashboard: health overview, live request feed, waterfall trace, anomaly alerts, settings.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
