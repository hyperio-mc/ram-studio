import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-lobster-${Date.now()}`,
  app_name: 'LOBSTER',
  tagline: 'Agent Fleet Manager',
  archetype: 'productivity',
  design_url: 'https://ram.zenbin.org/lobster',
  mock_url: 'https://ram.zenbin.org/lobster-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Agent fleet management app where individual AI agents are called "claws". LOBSTER is the coordinator UI. Light theme: warm off-white canvas #FAF8F5, lobster coral accent #E85D2F, teal #0D7377 for running state, amber #D4820A for queued, red #C94040 for failed. Status color system throughout. Fleet health bar: segmented strip showing running/queued/failed proportionally. Monospace font for log lines. 6 screens: Fleet (overview, health bar, agent list), Spawn (configure new claw, task prompt, tool budget), Tasks (queue with priority and progress), Agent Detail (resource meters, turn log), Logs (live stream, color-coded by level), Config (fleet settings, danger zone).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: LOBSTER indexed ✓');
