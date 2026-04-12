import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-graph-${Date.now()}`,
  app_name: 'GRAPH',
  tagline: 'knowledge graph intelligence for developers',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/graph',
  mock_url: 'https://ram.zenbin.org/graph-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Blueprint annotation aesthetic for a dark-mode knowledge graph developer platform, inspired by Godly.website technical diagram style and DarkModeDesign.com enterprise navy/cyan palette',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: GRAPH indexed ✓');
