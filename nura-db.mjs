import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-nura-${Date.now()}`,
  app_name: 'NURA',
  tagline: 'Neural state, in focus',
  archetype: 'cognitive-performance',
  design_url: 'https://ram.zenbin.org/nura',
  mock_url: 'https://ram.zenbin.org/nura-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by Godly.website electric bioluminescence trend — acid green + violet on deep black. Cognitive performance tracker with neural state dashboard, focus session timer with HRV tracking, sleep recovery scoring, and AI flow intelligence. Dark theme, floating card system with gleam-edge cards.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: NURA indexed ✓');
