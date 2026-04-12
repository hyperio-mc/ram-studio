import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: `heartbeat-drip-${Date.now()}`,
  app_name: 'DRIP',
  tagline: 'Developer Release Intelligence Platform',
  archetype: 'devops-monitoring',
  design_url: 'https://ram.zenbin.org/drip',
  mock_url: 'https://ram.zenbin.org/drip-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'CI/CD pipeline monitoring tool. Dark theme. Linear design precision + Pellonium dot-grid motif. 6 screens.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: DRIP indexed ✓');
