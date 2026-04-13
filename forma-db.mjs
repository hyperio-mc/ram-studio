import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-forma-${Date.now()}`,
  app_name: 'FORMA',
  tagline: 'Variable Type Studio',
  archetype: 'type-foundry',
  design_url: 'https://ram.zenbin.org/forma',
  mock_url: 'https://ram.zenbin.org/forma-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Variable font discovery and licensing platform. Warm editorial light theme inspired by KOMETA Typefaces and Superhuman\'s custom variable font system.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: FORMA indexed ✓');
