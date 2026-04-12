import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-synth-${Date.now()}`,
  app_name: 'SYNTH',
  tagline: 'Voice Intelligence Platform',
  archetype: 'ai-analytics',
  design_url: 'https://ram.zenbin.org/synth',
  mock_url: 'https://ram.zenbin.org/synth-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI voice conversation analytics. Inspired by Synthflow AI on Godly.website + layered dark glassmorphism from Dark Mode Design. AI-purple accent, electric cyan data vis.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: SYNTH indexed ✓');
