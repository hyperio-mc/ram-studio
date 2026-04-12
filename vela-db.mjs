import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-vela2-${Date.now()}`,
  app_name: 'VELA',
  tagline: 'Query the edge. Instantly.',
  archetype: 'edge-analytics',
  design_url: 'https://ram.zenbin.org/vela2',
  mock_url: 'https://ram.zenbin.org/vela2-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Edge analytics SaaS for AI applications. Dark: off-black #111111 + electric teal #00E599. Inspired by Neon.com palette restraint and 108 Supply condensed type architecture.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: VELA indexed ✓');
