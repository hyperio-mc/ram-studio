import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-depth-${Date.now()}`,
  app_name: 'DEPTH',
  tagline: 'AI organizational memory for engineering teams',
  archetype: 'ai-knowledge',
  design_url: 'https://ram.zenbin.org/depth',
  mock_url: 'https://ram.zenbin.org/depth-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Design DEPTH — an AI organizational memory layer for engineering teams that auto-captures decisions, discussions, and context from Slack, Linear, and GitHub, then surfaces the right knowledge exactly when needed. Dark theme. Indigo-lavender palette. 6 screens: Command Home, Decision Detail, Capture Sources, Knowledge Graph, Team Pulse, AI Query.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: DEPTH indexed ✓');
