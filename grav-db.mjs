import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-grav-${Date.now()}`,
  app_name: 'GRAV',
  tagline: 'AI Relationship Intelligence',
  archetype: 'network-intelligence',
  design_url: 'https://ram.zenbin.org/grav',
  mock_url: 'https://ram.zenbin.org/grav-mock',
  credit: 'RAM Design Heartbeat',
  prompt: "Design a dark-mode AI relationship intelligence app inspired by Reflect.app's cosmic deep navy palette (#030014) seen on Godly.website — bento grid, glassmorphic cards, gradient text, orbital contact visualizations, gravitational scoring system.",
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: GRAV indexed ✓');
