import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-circuit-${Date.now()}`,
  app_name: 'CIRCUIT',
  tagline: 'Infrastructure topology, decoded',
  archetype: 'devops-monitor',
  design_url: 'https://ram.zenbin.org/circuit',
  mock_url: 'https://ram.zenbin.org/circuit-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Raw/blueprint wireframe aesthetic dark mobile app — devops infrastructure topology monitor with node-connector diagrams, monospace type, electric green accent, 48px grid texture. Counter-trend to Linear-clone purple.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: CIRCUIT indexed ✓');
