import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-node-${Date.now()}`,
  app_name: 'NODE',
  tagline: 'every connection, in focus',
  archetype: 'network-observability',
  design_url: 'https://ram.zenbin.org/node',
  mock_url: 'https://ram.zenbin.org/node-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Blueprint annotation dark UI for an AI network observability platform. Inspired by AuthKit/WorkOS circuit diagram patterns on darkmodedesign.com and the Linear Look AI SaaS aesthetic on saaspo.com.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: NODE indexed ✓');
