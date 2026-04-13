import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: `heartbeat-spline-${Date.now()}`,
  app_name: 'SPLINE',
  tagline: 'deployment intelligence, in real time',
  archetype: 'devops-observability',
  design_url: 'https://ram.zenbin.org/spline',
  mock_url: 'https://ram.zenbin.org/spline-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Deployment intelligence platform — real-time monitoring, error tracking, performance metrics, and team activity feed. Inspired by Godly.website developer tools trend (Height, AuthKit, Superpower).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SPLINE indexed ✓');
